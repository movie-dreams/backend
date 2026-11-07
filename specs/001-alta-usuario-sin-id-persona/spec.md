# Spec 001 — Alta de usuario sin identificador de persona

Estado: aprobada

## Contexto y objetivo

Hoy el alta de un usuario exige que el solicitante envíe el **identificador de una
persona ya registrada** y un **nombre de usuario** propio; si esa persona todavía no
existe, el alta es imposible, y la cuenta recién creada queda sin rol y sin registro de
cliente, por lo que no puede operar.

La intención funcional del solicitante es que el alta de un usuario **deje de depender de
una persona previamente registrada y de un nombre de usuario elegido**: aportando
únicamente su **email** y su **contraseña**, la operación debe crear de forma conjunta la
**persona** asociada (solo con su email), la **cuenta** (cuyo nombre de usuario es, en
esta primera instancia, el email) y el **registro de cliente** del titular, dejando la
cuenta **lista para operar** como cliente del negocio desde el primer momento y utilizable
para autenticarse con el email.

Además, esta feature **alinea el inicio de sesión** con la contraseña que el alta admite,
de modo que toda cuenta creada pueda autenticarse siempre, y hace que el inicio de sesión
trate el nombre de usuario (el email) con la misma normalización que el alta.

La verificación de esta feature detectó además fugas de la contraseña en respuestas cuya
documentación declara un contrato que no la incluye: **la consulta del listado de cuentas,
la consulta de una cuenta concreta y la respuesta de la actualización de una cuenta**, y
también las **consultas de asignaciones de rol**, que entregan la cuenta asociada completa.
El usuario ha aprobado corregirlas dentro de esta feature: ninguna de esas respuestas
volverá a exponer la contraseña —ni en texto plano ni protegida—, sin cambiar el resto de su
contrato ni la estructura de los datos.

## Usuarios

- **Administrador del sistema**: único perfil autorizado para dar de alta usuarios; hoy
  es quien debe disponer de un identificador de persona y de un nombre de usuario válidos.
- **Persona que recibe la cuenta**: no interactúa con el alta, pero es la titular del
  email que se registra y de la que depende el registro de cliente creado.
- **Usuario creado**: queda con rol «Cliente» activo y reconocido como cliente del
  negocio, por lo que puede autenticarse y operar de inmediato.

## Historias de usuario

- HU-1. Como administrador, quiero dar de alta un usuario indicando solo su email y su
  contraseña, para no tener que registrar antes la persona, ni conocer su identificador,
  ni inventar un nombre de usuario.
- HU-2. Como administrador, quiero que la persona asociada se registre junto con la
  cuenta y con su email, para que el email quede disponible para el negocio.
- HU-3. Como persona que recibe la cuenta, quiero autenticarme usando mi email, para
  acceder al sistema sin tener que recordar otro nombre de usuario.
- HU-4. Como responsable del sistema, quiero que un alta fallida no deje datos a medias,
  para mantener la consistencia entre personas, cuentas y clientes.
- HU-5. Como administrador, quiero recibir un rechazo claro y en español cuando algún
  dato del alta falte, sea inválido, exceda su longitud o su email ya esté en uso, para
  no generar cuentas ni personas duplicadas ni mal formadas.
- HU-6. Como administrador, quiero que toda cuenta creada pueda iniciar sesión con la
  contraseña que se le entregó, para evitar cuentas creadas e inutilizables.
- HU-7. Como administrador, quiero que el usuario creado quede de inmediato como cliente
  del negocio con el rol «Cliente» activo, para que pueda comprar entradas sin pasos
  manuales adicionales.
- HU-8. Como titular de la cuenta, quiero que el negocio me reconozca como cliente desde
  el momento del alta, para poder operar (venta y reservas) sin trámites posteriores.
- HU-9. Como responsable del sistema, quiero que la consulta del listado de cuentas, la de
  una cuenta concreta y la respuesta de la actualización de una cuenta nunca expongan la
  contraseña, para que un dato sensible no se filtre a quien consulta o modifica la
  información de las cuentas.
- HU-10. Como responsable del sistema, quiero que las consultas de asignaciones de rol
  —el listado y una asignación concreta— tampoco expongan la contraseña de la cuenta
  asociada, para que la información de seguridad no se filtre por una vía distinta a la de
  las cuentas.

## Definiciones

- **Persona**: registro de la identidad de la persona física (identidad del negocio) con
  datos de contacto y personales, la mayoría opcionales. En esta feature se crea con el
  email como único dato informado.
- **Usuario**: cuenta de acceso al sistema, asociada de forma uno a uno con una persona;
  su identificador es el mismo que el de la persona asociada y, en esta primera
  instancia, **su nombre de usuario es su email**.
- **Nombre de usuario de la cuenta**: dato con el que la cuenta se autentica; en esta
  primera instancia es el email del titular, normalizado.
- **Datos mínimos de persona**: el email recibido en el alta. Nombres, apellidos,
  documento, teléfono y fecha de nacimiento **no se informan**, no se inventan y no se
  derivan de ningún otro dato.
- **Email del negocio**: dirección de correo que identifica a la persona; reside en el
  email de la persona, que es el único lugar disponible para almacenarlo.
- **Alta conjunta**: creación, en una sola operación, de la persona, la cuenta y el
  registro de cliente del titular.
- **Identificador de persona**: valor interno que identifica una persona ya registrada;
  deja de ser un dato de entrada del alta y su presencia en la solicitud provoca rechazo.
- **Rol «Cliente»**: rol de negocio que habilita las operaciones de cliente del negocio.
  Es el rol con el que se crea por defecto toda cuenta en esta feature y ya existe en los
  datos del negocio.
- **Asignación de rol activa**: vinculación vigente entre la cuenta y el rol «Cliente»,
  que habilita a la cuenta a operar; se distingue de una vinculación inactiva, que no
  habilita.
- **Cliente del negocio**: registro que reconoce a una persona como cliente del negocio,
  asociado a su persona y con un dato de actividad que debe quedar en valor «activo»
  para poder operar.
- **Contraseña en texto plano**: contraseña tal como la envía el solicitante, antes de
  cualquier protección que impida recuperarla.
- **Contraseña no recuperable**: forma de almacenamiento de la contraseña que no permite
  obtener el texto original y con la que el inicio de sesión puede validarla.
- **Normalización**: recorte de espacios al inicio y al final, y conversión a minúsculas.
- **Conflicto**: rechazo del alta porque el email ya está registrado; se comunica con la
  respuesta de conflicto (409). La comparación que lo detecta no distingue mayúsculas ni
  espacios y aplica tanto al valor entrante como a los valores ya guardados.
- **Solicitud inválida**: rechazo del alta porque la solicitud trae un dato no admitido o
  un dato obligatorio que queda vacío; se comunica con la respuesta de solicitud inválida
  (400).
- **Forma de dirección de correo válida**: dirección que incluye la arroba y un dominio,
  sin espacios internos.
- **Fechas heredadas**: la fecha de creación de la cuenta (que forma parte del contrato
  de salida actual del alta) y la fecha del registro de cliente son datos generados por el
  sistema de datos; el backend no las calcula. Esta feature no modifica ningún valor
  existente y solo autoriza, para la fecha de creación de la cuenta, un valor por defecto en
  el origen de datos (D-25), de modo que toda cuenta nueva traiga una fecha real.

## Requisitos funcionales

- RF-1: CUANDO un administrador solicita el alta de un usuario enviando email y
  contraseña, EL SISTEMA crea de forma conjunta la persona asociada, la cuenta y el
  registro de cliente del titular, sin exigir ningún identificador de persona ni ningún
  nombre de usuario en la solicitud.
- RF-2: EL SISTEMA admite como datos de entrada del alta únicamente el email y la
  contraseña, y ningún otro dato; en particular, no admite el nombre de usuario ni el
  identificador de persona.
- RF-3: SI la solicitud de alta no incluye el email, o no incluye la contraseña, ENTONCES
  EL SISTEMA rechaza la solicitud sin crear persona, ni cuenta, ni cliente, y la respuesta
  identifica en español, uno por uno, cada dato que falta.
- RF-4: SI el email enviado no tiene forma de dirección de correo válida (le falta la
  arroba o el dominio, o contiene espacios internos), ENTONCES EL SISTEMA rechaza la
  solicitud sin crear persona, ni cuenta, ni cliente, e indica en español que el email no
  es válido.
- RF-5: CUANDO el alta recibe el email, EL SISTEMA lo normaliza (recorta espacios al
  inicio y al final y lo convierte a minúsculas) antes de guardarlo, antes de usarlo como
  nombre de usuario y antes de comprobar si ya está registrado.
- RF-6: SI el email queda vacío después de normalizarlo, ENTONCES EL SISTEMA rechaza el
  alta con la respuesta de solicitud inválida (400), sin crear persona, ni cuenta, ni
  cliente, e indica en español que el email es obligatorio.
- RF-7: SI el email normalizado supera los 255 caracteres, ENTONCES EL SISTEMA rechaza el
  alta sin crear persona, ni cuenta, ni cliente, e indica en español la longitud máxima
  admitida para el email.
- RF-8: SI la contraseña tiene menos de 6 caracteres o más de 100 caracteres, ENTONCES EL
  SISTEMA rechaza el alta sin crear persona, ni cuenta, ni cliente, e indica en español
  que la contraseña debe tener entre 6 y 100 caracteres.
- RF-9: CUANDO el alta se realiza con éxito, EL SISTEMA establece como nombre de usuario
  de la cuenta el email normalizado recibido, de modo que la cuenta se autentica con su
  email.
- RF-10: CUANDO el alta se realiza con éxito, EL SISTEMA registra el email normalizado
  recibido como el email de la persona creada, de modo que quede disponible para el
  negocio.
- RF-11: CUANDO el alta se realiza con éxito, EL SISTEMA registra la persona sin informar
  el resto de sus datos personales (nombres, apellidos, documento, teléfono y fecha de
  nacimiento), sin inventarlos ni derivarlos de otro dato.
- RF-12: CUANDO el alta se realiza con éxito, EL SISTEMA almacena la contraseña de forma
  no recuperable, de manera que el inicio de sesión pueda validarla contra la contraseña
  originalmente enviada.
- RF-13: CUANDO el alta se realiza con éxito, EL SISTEMA asigna a la cuenta creada el rol
  «Cliente» con su vinculación **activa**, sin necesidad de ninguna operación posterior.
- RF-14: CUANDO el alta se realiza con éxito, EL SISTEMA crea el registro de cliente del
  negocio asociado a la persona creada, con su dato de actividad en valor **activo**.
- RF-15: CUANDO el alta se realiza con éxito, EL SISTEMA responde con los datos de la
  cuenta creada —identificador, nombre de usuario y fecha de creación heredada, con un
  valor de fecha real y nunca nulo— y nunca con la contraseña, ni en texto plano ni
  protegida.
- RF-16: EL SISTEMA identifica cada cuenta con el mismo identificador de la persona
  asociada; como invariante derivada de esa relación uno a uno, una persona no puede
  tener más de una cuenta, de modo que todo segundo alta con el mismo email se rechaza
  por RF-17.
- RF-17: SI ya existe una persona registrada o una cuenta cuyo email coincide con el
  email solicitado —comparando **sin distinguir mayúsculas ni espacios**, tanto el valor
  entrante como los valores ya guardados—, ENTONCES EL SISTEMA rechaza el alta con la
  respuesta de conflicto (409), sin crear persona, ni cuenta, ni cliente, e indica en
  español que el email ya está registrado.
- RF-18: SI la solicitud incluye un nombre de usuario, ENTONCES EL SISTEMA rechaza el
  alta con la respuesta de solicitud inválida (400), sin crear persona, ni cuenta, ni
  cliente, e indica en español que el nombre de usuario no es un dato admitido.
- RF-19: SI la solicitud incluye un identificador de persona, ENTONCES EL SISTEMA rechaza
  el alta con la respuesta de solicitud inválida (400), sin crear persona, ni cuenta, ni
  cliente, e indica en español que el identificador de persona no es un dato admitido.
- RF-20: SI falla la creación de la cuenta o la del registro de cliente después de
  haberse creado los registros anteriores (la cuenta no puede existir sin persona, y el
  cliente se asocia a la persona), ENTONCES EL SISTEMA revierte el alta completa, sin
  dejar ninguna persona, cuenta ni cliente parciales ni huérfanos.
- RF-21: MIENTRAS el solicitante no esté autenticado con el perfil de administrador, EL
  SISTEMA impide el alta de usuarios.
- RF-22: EL SISTEMA admite en el inicio de sesión contraseñas de entre 6 y 100
  caracteres, sin rechazar por longitud ninguna contraseña que el alta acepte.
- RF-23: CUANDO el inicio de sesión recibe el nombre de usuario (el email de la cuenta),
  EL SISTEMA lo normaliza (recorta espacios al inicio y al final y lo convierte a
  minúsculas) antes de buscarlo.
- RF-24: CUANDO se consulta el listado de cuentas, se consulta una cuenta concreta o se
  actualiza una cuenta, EL SISTEMA devuelve los datos de la cuenta —identificador, nombre de
  usuario y fecha de creación heredada— y **nunca** su contraseña, ni en texto plano ni
  protegida, conservando el resto de la respuesta que hoy entrega (incluida la paginación del
  listado) y sin alterar el contrato de entrada de la actualización.
- RF-25: CUANDO se consulta el listado de asignaciones de rol o se consulta una asignación
  concreta, EL SISTEMA devuelve la asignación con todos sus datos —incluido su rol— y, de la
  cuenta asociada, su identificador, su nombre de usuario y su fecha de creación, y **nunca**
  la contraseña de esa cuenta, ni en texto plano ni protegida, conservando el resto de la
  respuesta que hoy entrega (incluida la paginación del listado).

## Requisitos no funcionales

- RNF-1: EL SISTEMA responde todo rechazo del alta con mensajes en español que
  identifican el dato o los datos rechazados, sin exponer detalles internos de
  almacenamiento.
- RNF-2: EL SISTEMA entrega el resultado del alta siempre consistente (persona, cuenta y
  cliente creados, o ninguno), conforme a RF-20.
- RNF-3: EL SISTEMA conserva sin cambios el contrato de salida de las operaciones de
  usuario —incluido el del alta—, conforme a RF-15; la única retirada admitida es la
  contraseña de las consultas y de la respuesta de la actualización de cuentas y de las
  consultas de asignaciones de rol, que nunca formó parte del contrato declarado (RF-24,
  RF-25).
- RNF-4: EL SISTEMA nunca devuelve la contraseña en las respuestas del alta, ni en las de
  consulta, listado y actualización de cuentas, ni en las de consulta y listado de
  asignaciones de rol —ni en texto plano ni protegida, incluidos los rechazos—, conforme a
  RF-15, RF-24 y RF-25.
- RNF-5: EL SISTEMA documenta el alta y el inicio de sesión en español, en línea con el
  resto de la interfaz del servicio.
- RNF-6: EL SISTEMA valida el formato, los datos faltantes y las longitudes admitidas
  antes de crear cualquier registro, conforme a RF-3 a RF-8.
- RNF-7: EL SISTEMA deja la cuenta creada en condiciones de operar sin intervención
  manual posterior: nombre de usuario, contraseña utilizable, rol «Cliente» activo y
  registro de cliente activo, conforme a RF-9, RF-12, RF-13 y RF-14.

## Casos límite

Cada caso declara el requisito que lo gobierna y el resultado observable.

- Email ausente, o vacío, o compuesto solo por espacios (queda vacío tras normalizar) →
  RF-3 y RF-6: rechazo con 400, mensaje en español indicando que el email es obligatorio,
  y ningún registro creado.
- Contraseña ausente → RF-3: rechazo identificando en español el dato faltante y ningún
  registro creado.
- Email y contraseña ausentes a la vez → RF-3: rechazo identificando en español ambos
  datos faltantes y ningún registro creado.
- Email normalizado de 256 caracteres → RF-7: rechazo con mensaje en español de la
  longitud máxima admitida y ningún registro creado.
- Email normalizado de 255 caracteres → RF-7 y RF-1: alta aceptada.
- Email válido de 60 caracteres → RF-7 y RF-9: alta aceptada, y la cuenta se autentica
  con ese email como nombre de usuario (antes no habría cabido en el nombre de usuario).
- Email sin arroba, sin dominio, o con espacios internos → RF-4: rechazo indicando que el
  email no es válido y ningún registro creado.
- Contraseña de 5 caracteres → RF-8: rechazo indicando el rango 6–100 y ningún registro
  creado.
- Contraseña de 101 caracteres → RF-8: rechazo indicando el rango 6–100 y ningún registro
  creado.
- Contraseña de 90 caracteres en el alta → RF-8 y RF-1: alta aceptada.
- Login con una contraseña de 90 caracteres de una cuenta creada en el alta → RF-22 y
  RF-12: inicio de sesión aceptado (antes lo habría rechazado el máximo previo).
- Email con espacios al inicio o al final, o con mayúsculas, que normalizado coincide con
  un email ya registrado → RF-5 y RF-17: rechazo con conflicto (409), mensaje en español
  de email ya registrado, y ningún registro creado (ni persona, ni cuenta, ni cliente).
- Segundo alta con un email ya registrado → RF-17: rechazo con conflicto (409); la
  persona existente no se reutiliza, no se crea otra persona, ni otra cuenta, ni ningún
  cliente.
- Alta correcta y, después, segundo alta con el mismo email (única forma de apuntar a la
  misma persona, porque el alta ya no referencia personas) → RF-17: rechazo con conflicto
  (409) y ningún registro creado; no puede existir una segunda cuenta para la misma
  persona (invariante derivada de RF-16).
- Email ya guardado con mayúsculas o con espacios, solicitado de nuevo con otra
  combinación de mayúsculas o espacios → RF-5 y RF-17: rechazo con conflicto (409) y
  ningún registro creado, porque la comparación no distingue mayúsculas ni espacios.
- Fallo al crear la cuenta después de haberse creado la persona → RF-20 y RNF-2: no queda
  ninguna persona huérfana ni registro parcial.
- Fallo al crear el registro de cliente después de haberse creado la cuenta → RF-20 y
  RNF-2: no queda ninguna persona ni cuenta parcial ni huérfana.
- Alta solicitada sin credenciales de administrador válidas → RF-21: rechazo sin crear
  registros.
- Solicitud que incluye un nombre de usuario → RF-2 y RF-18: rechazo con 400, mensaje en
  español de dato no admitido y ningún registro creado.
- Solicitud que incluye un identificador de persona → RF-2 y RF-19: rechazo con 400,
  mensaje en español de dato no admitido y ningún registro creado.
- Solicitud que incluye cualquier dato distinto del email y la contraseña → RF-2: rechazo
  con 400 y ningún registro creado.
- Cuenta recién creada y acceso con ella a una operación protegida para el rol
  «Cliente» → RF-13 y RF-14: el acceso se concede; se observa la vinculación activa con
  el rol «Cliente» y el registro de cliente del titular en «activo».
- Datos del negocio en los que no existiera el rol «Cliente» → el alta no puede
  completarse, porque no podría asignar el rol por defecto (ver «Límites conocidos»).
- Cuenta recién creada y consulta de su rol asignado → RF-13: se observa la vinculación
  con el rol «Cliente» en estado activo.
- Cuenta recién creada y consulta de su cliente del negocio → RF-14: se observa el
  registro de cliente asociado a la persona creada, con su dato de actividad en «activo».
- Login de la cuenta creada escribiendo su email con mayúsculas o con espacios al
  principio o al final → RF-23 y RF-9: inicio de sesión aceptado.
- Nombre de usuario de la cuenta creada → RF-9: coincide con el email normalizado del
  titular.
- Consulta del listado de cuentas, consulta de una cuenta concreta y actualización de una
  cuenta con contraseña en el cuerpo → RF-24 y RNF-4: ninguna de las tres respuestas contiene
  la contraseña en ningún formato (ni en texto plano ni protegida) y todas conservan el resto
  de sus datos; el listado conserva además su paginación.
- Consulta del listado de asignaciones de rol y consulta de una asignación concreta →
  RF-25 y RNF-4: ninguna de las dos respuestas contiene la contraseña de la cuenta asociada
  en ningún formato (ni en texto plano ni protegida), la asignación conserva todos sus datos
  y su rol, y el listado conserva además su paginación.
- Inicio de sesión de una cuenta existente después de retirar la contraseña de las respuestas
  de consulta y de actualización de cuentas → RF-12 y RNF-7: el inicio de sesión sigue
  aceptando la contraseña correcta —también inmediatamente después de actualizarla—, porque
  la contraseña sigue disponible para validarla.

## Fuera de alcance

- La asignación de roles distintos de «Cliente»: la asignación de otros roles continúa
  siendo responsabilidad de su operación específica de asignación de roles.
- La modificación posterior del rol por defecto o del estado de actividad del cliente
  creados por el alta.
- Reutilizar una persona existente cuando el email ya está registrado: se rechaza el
  alta.
- La creación del registro de cliente por la vía de alta ya existente del negocio, que no
  cambia salvo por lo indicado en esta feature.
- La captura de datos personales adicionales (nombres, apellidos, documento, teléfono y
  fecha de nacimiento) como datos obligatorios o de formulario ampliado.
- La modificación de los datos de la persona creada una vez dada de alta.
- La emisión de tokens y el resto del comportamiento del inicio de sesión distinto de la
  longitud de la contraseña admitida y de la normalización del nombre de usuario/email.
- Cambiar la forma de almacenar la contraseña o su uso para validar el inicio de sesión: la
  contraseña debe seguir disponible para autenticar, y ninguna respuesta del alta ni de las
  consultas ni de la actualización de cuentas ni de las consultas de asignaciones de rol
  puede exponerla (RF-24, RF-25).
- Cambiar el contrato de entrada de la actualización de una cuenta (sigue admitiendo los
  mismos datos y conserva su comportamiento actual): esta feature solo retira la contraseña
  de su respuesta.
- Las fechas heredadas: la fecha de creación de la cuenta (parte del contrato de salida
  actual) y la fecha del registro de cliente las genera el sistema de datos; el backend no
  las calcula ni las modifica. La única intervención autorizada es el valor por defecto de
  la fecha de creación para las cuentas nuevas (D-25); ningún valor existente se rellena ni
  se altera.
- Cualquier cambio en la estructura de datos distinto del autorizado por el usuario
  (la ampliación de longitud del nombre de usuario y la materialización de su unicidad
  —D-20, D-21—, y el valor por defecto de la fecha de creación de la cuenta —D-25—; ver
  «Límites conocidos»).
- Cualquier cambio en la interfaz del frontend que consume el servicio.

## Compatibilidad hacia atrás

- **Alta — contrato de entrada**: cambia. Los datos admitidos pasan a ser exactamente el
  email y la contraseña; el antiguo nombre de usuario y el identificador de persona se
  rechazan con 400 por ser datos no admitidos.
- **Alta — contrato de salida**: se mantiene sin cambios (identificador, nombre de
  usuario y fecha de creación heredada; sin contraseña). El único cambio observable es de
  contenido, no de forma: toda cuenta nueva trae una fecha de creación real (D-25), donde
  antes podía venir sin valor.
- **Nombre de usuario de la cuenta**: el rango de longitud admitido es ampliativo (ahora
  admite cualquier email válido hasta el máximo del email), por lo que ningún valor que
  antes se aceptara deja de aceptarse.
- **Inicio de sesión — contrato de entrada**: cambia de forma ampliativa. El máximo de
  contraseña pasa de 50 a 100 caracteres (RF-22) y el nombre de usuario (el email) se
  normaliza antes de buscarlo (RF-23); ningún caso que antes se aceptaba se rechaza.
- **Consulta, listado y actualización de cuentas — contrato de salida**: cambia **solo** para
  retirar la contraseña, que la documentación nunca declaró y que no debe exponerse (RF-24,
  RNF-4). El resto de la respuesta se conserva —los datos de la cuenta y la paginación del
  listado—, y el contrato de entrada de la actualización no cambia, de modo que ningún otro
  dato ni la forma de consultar o actualizar cambian.
- **Consulta y listado de asignaciones de rol — contrato de salida**: cambia **solo** para
  retirar la contraseña de la cuenta asociada, que la documentación nunca declaró (RF-25,
  RNF-4). La asignación conserva todos sus datos, su rol y los datos restantes de la cuenta;
  tampoco cambian la forma de consultar ni la paginación del listado.
- **Cuentas creadas antes de esta feature**: siguen autenticándose igual; el alta deja de
  admitir el identificador de persona y el nombre de usuario, pero no altera su estado. Si
  alguna conserva la fecha de creación sin valor, **no se rellena** (D-25): sus datos no se
  modifican.
- **Divergencia entre las dos vías de alta**: la vía de alta de personas ya existente no
  cambia (sigue recibiendo un nombre de usuario explícito y también crea cuenta y
  cliente), mientras esta vía de alta de usuarios usa el email como nombre de usuario.
  Consecuencia: pueden coexistir cuentas cuyo nombre de usuario no sea un email, y esta
  feature no las modifica.

## Límites conocidos y consecuencias de negocio

- **Unicidad del email**: el control previo del email se hace en la aplicación para poder
  responder un conflicto (409) con mensaje claro y para cubrir el caso de personas
  existentes sin cuenta; la comparación **no distingue mayúsculas ni espacios**, ni en el
  valor entrante ni en los valores ya guardados, de modo que un dato histórico almacenado
  con otro formato no puede esquivar el control. La **garantía de unicidad** del nombre de
  la cuenta (que comparte valor con el email) **existe en los datos una vez aplicado el
  cambio estructural autorizado** (D-20 y D-21); hasta entonces no hay garantía frente a
  altas simultáneas.
- **Riesgo del cambio estructural autorizado**: si en los datos actuales ya existen
  nombres de usuario repetidos, el cambio no podría aplicarse hasta depurarlos, y la
  garantía de unicidad no existiría mientras el cambio no esté aplicado.
- **Valor por defecto de la fecha de creación (segundo cambio estructural autorizado,
  D-25)**: el valor por defecto solo alcanza a las filas nuevas; las filas existentes con la
  fecha sin valor se conservan así, de modo que una cuenta antigua puede seguir mostrando la
  fecha vacía. No se rellena ningún dato preexistente.
- **Dependencia del rol «Cliente»**: el alta falla por completo si el rol «Cliente» no
  existe en los datos del negocio, porque no puede asignar el rol por defecto. Es una
  dependencia conocida de los datos.
- **Personas con el mismo email sin cuenta**: pueden existir en los datos actuales; el
  alta se rechazará para esos emails por conflicto, sin modificar ni reutilizar las
  personas existentes.
- **Divergencia entre las dos vías de alta**: la vía de alta de personas ya existente no
  cambia y sigue recibiendo un nombre de usuario explícito, de modo que pueden coexistir
  cuentas cuyo nombre de usuario no sea un email; esta feature no las modifica.
- **Fechas heredadas**: la fecha de creación de la cuenta y la fecha del registro de
  cliente las genera el sistema de datos, no el backend. Las cuentas creadas **antes** de
  esta feature pueden conservar la fecha de creación sin valor (no se rellena) y las nuevas
  ya la traen (D-25); el registro de cliente conserva su comportamiento actual.
- **Una persona, una cuenta**: como el identificador de la cuenta es el de la persona
  asociada, una misma persona no puede tener dos cuentas; el rechazo observable de un
  segundo intento llega por el conflicto de email (RF-17).
- **Nombre de usuario igual al email**: en esta primera instancia no es posible tener una
  cuenta creada por esta vía cuyo nombre de usuario difiera de su email; cambiarlo queda
  fuera del alcance de esta feature.
- **Ampliación de longitud del nombre de usuario**: autorizada por el usuario para que el
  nombre de usuario (el email) quepa hasta el máximo del email; los datos creados antes de
  esta feature no se ven afectados.

## Criterios de finalización

- La spec queda `aprobada` por el usuario (cierre de la Fase 2).
- No quedan dudas abiertas: todas las decisiones de negocio están registradas en la
  sección `Decisiones`.
- (a) Un alta con solo email y contraseña se completa con éxito y devuelve el
  identificador, el nombre de usuario (el email normalizado) y la fecha de creación
  heredada con un valor de fecha real (no nulo).
- (b) La persona creada queda observablemente con su email normalizado y con el resto de
  sus datos personales sin informar: se comprueba observando el registro de la persona
  creada y contrastando su email y la ausencia de nombres, apellidos, documento, teléfono
  y fecha de nacimiento.
- (c) La cuenta creada tiene asignado el rol «Cliente» con su vinculación activa: se
  comprueba observando las asignaciones de rol de la cuenta creada.
- (d) Existe el registro de cliente del negocio asociado a la persona creada y su dato de
  actividad vale «activo»: se comprueba observando el registro de cliente del titular.
- (e) El titular inicia sesión usando su email como nombre de usuario, incluso
  escribiéndolo con mayúsculas o con espacios al principio o al final, y con la contraseña
  originalmente enviada.
- (f) Los rechazos de RF-3, RF-4, RF-6, RF-7, RF-8, RF-17, RF-18 y RF-19 se producen con
  el resultado declarado (400 o 409), con un mensaje en español que identifique el dato o
  los datos rechazados o faltantes (basta con identificarlos; no se exige un texto
  literal) y **sin crear persona, ni cuenta, ni cliente**.
- (g) Ninguna respuesta del alta —de éxito o de rechazo—, ni de las consultas de cuentas
  (listado y cuenta concreta), ni de la actualización de una cuenta, ni de las consultas de
  asignaciones de rol (listado y asignación concreta) devuelve la contraseña, ni en texto
  plano ni protegida.
- (h) El email queda guardado normalizado y la comprobación de email ya registrado compara
  sin distinguir mayúsculas ni espacios, tanto el valor entrante como los valores ya
  guardados.
- (i) Tras un fallo en la creación de la cuenta o del registro de cliente no queda
  ninguna persona, cuenta ni cliente parcial ni huérfano.
- (j) El alta exige autenticación con el perfil de administrador.
- (k) El inicio de sesión acepta contraseñas de hasta 100 caracteres, sin dejar de aceptar
  los casos que ya aceptaba.
- (l) Un email de más de 255 caracteres se rechaza, mientras un email largo pero válido
  (por ejemplo, de 60 caracteres) se acepta en el alta.
- (m) Las demás operaciones de usuario conservan su contrato sin cambios.
- (n) Una vez aplicado el cambio estructural autorizado, no puede existir más de una
  cuenta con el mismo nombre de usuario (el email), y el nombre de usuario de la cuenta
  creada coincide con el email normalizado de su titular.
- (o) El listado de cuentas, la consulta de una cuenta concreta y la actualización de una
  cuenta con contraseña en el cuerpo se ejecutan con éxito, conservan sus datos y la
  paginación del listado, y **ninguna** de las tres respuestas contiene la contraseña en
  ningún formato (ni en texto plano ni protegida); además, el inicio de sesión de una cuenta
  existente sigue funcionando con su contraseña, también después de actualizarla.
- (p) El listado de asignaciones de rol y la consulta de una asignación concreta se ejecutan
  con éxito, conservan todos sus datos —la asignación, su rol y los datos de la cuenta
  asociada— y la paginación del listado, y **ninguna** de las dos respuestas contiene la
  contraseña en ningún formato (ni en texto plano ni protegida).

## Decisiones

Decisiones tomadas por el usuario. **No quedan dudas abiertas.**

- D-1. Datos mínimos de persona: se crea la persona **solo con el email**. Nombres,
  apellidos, documento, teléfono y fecha de nacimiento quedan sin informar; no se
  inventan ni se derivan del nombre de usuario. (RF-11)
- D-2. Almacenamiento del email: el email recibido se guarda en el **email de la
  persona**, único lugar disponible. (RF-10)
- D-3. Contraseña: el alta **sí** la guarda de forma no recuperable, con el mismo
  mecanismo que ya usa el registro de usuarios existente, para que el inicio de sesión
  pueda validarla. (RF-12)
- D-4. **Sustituida por D-18.** (Antes: el alta no asignaba ningún rol.)
- D-5. Duplicados: se **rechaza** el alta si el email ya está registrado (como email de
  una persona o como nombre de usuario de una cuenta), comparando sin distinguir
  mayúsculas ni espacios (D-22), sin crear persona, ni cuenta, ni cliente, con la
  respuesta de conflicto (409) y mensaje en español. No se reutiliza la persona
  existente. (RF-17)
- D-6. Contrato de salida: se mantiene el contrato de salida actual del alta
  —identificador, nombre de usuario y fecha de creación heredada—, **sin contraseña**.
  (RF-15, RNF-3)
- D-7. Atomicidad: persona, cuenta y registro de cliente se crean como una única unidad
  de trabajo; si falla la creación de la cuenta o la del cliente se revierte todo y no
  quedan registros huérfanos ni parciales. (RF-20, RNF-2)
- D-8. Cliente con identificador de persona: la solicitud que lo incluya se **rechaza con
  la respuesta de solicitud inválida (400)**, al no ser un dato admitido. (RF-19)
- D-9. Normalización: se recortan espacios y se convierte a **minúsculas** el email antes
  de guardarlo, antes de usarlo como nombre de usuario y antes de comprobar duplicados.
  (RF-5)
- D-10. Formato del email: **sí** se valida. Debe tener forma de dirección válida, con
  arroba y dominio; si no, se rechaza el alta sin crear registros, con mensaje en español.
  Coherente con el contrato de alta de personas ya existente. (RF-4)
- D-11. Política única de contraseña: **6 a 100 caracteres**. El inicio de sesión se
  alinea al mismo máximo (antes 50), de modo que toda cuenta creada pueda autenticarse
  siempre; esto toca el contrato de entrada del inicio de sesión y forma parte del
  alcance. (RF-8, RF-22)
- D-12. Longitudes: el **email** admite hasta **255 caracteres** (el máximo del email) y
  el nombre de usuario de la cuenta admite cualquier email válido hasta ese máximo, tras
  la ampliación autorizada en D-20 (queda retirado el antiguo máximo de 50 caracteres del
  nombre de usuario). (RF-7, RF-9)
- D-13. **Email vacío tras normalizar** (ausente, vacío o solo espacios): se **rechaza con
  400** indicando en español que el email es obligatorio. (RF-6)
- D-14. Unicidad del email: el control previo se hace en la aplicación para poder
  responder el conflicto con mensaje claro y para cubrir el caso de personas existentes
  sin cuenta; la comparación es insensible a mayúsculas y espacios (D-22). La garantía de
  unicidad del nombre de la cuenta (= email) existe **una vez aplicado el cambio
  estructural autorizado** (D-20, D-21). («Límites conocidos»)
- D-15. **Sustituida por D-19.** (Antes: el alta no creaba el registro de cliente.)
- D-16. El inicio de sesión **también normaliza** el nombre de usuario (recorte de
  espacios y minúsculas) antes de buscarlo, para que una cuenta creada con el email
  «ana@dominio.com» pueda entrar escribiendo «ANA@dominio.com » o variantes con espacios.
  Forma parte del alcance. (RF-23)
- D-17. Entrada del alta: deja de recibir el nombre de usuario. Sus datos de entrada son
  **email y contraseña únicamente**, y sigue sin admitir el identificador de persona ni
  ningún otro dato. **En esta primera instancia el nombre de usuario de la cuenta es el
  email** normalizado, de modo que la cuenta se autentica con su email. Consecuencia: el
  antiguo requisito de nombre de usuario obligatorio pasa a ser email obligatorio, el caso
  de «nombre de usuario vacío tras normalizar» pasa a ser «email vacío tras normalizar» y
  el máximo de longitud aplicable es el del email. (RF-2, RF-6, RF-7, RF-9, RF-18)
- D-18. Rol por defecto: toda cuenta creada en el alta recibe el rol **«Cliente»** con su
  vinculación **activa**, sin pasos posteriores. El usuario indicó que ese rol ya existe en
  los datos del negocio como el tercer registro de rol (valor interno 3); la forma de
  resolverlo (por nombre estable del rol o por su identificador) corresponde al plan, no a
  la spec. Esto sustituye a D-4: el alta **sí** asigna rol. (RF-13)
- D-19. Registro de cliente: el alta **sí** crea el registro de cliente del negocio
  asociado a la persona creada, con su dato de actividad en valor **«activo»**, para que
  el titular quede reconocido como cliente del negocio desde el alta. Esto sustituye a
  D-15. (RF-14)
- D-20. Cambio de estructura de datos **autorizado explícitamente por el usuario**: se
  amplía la longitud del **nombre de usuario** almacenado de 50 a 255 caracteres, porque
  al ser el nombre de usuario igual al email (que admite hasta 255) la longitud anterior
  no cabría. Requisito observable derivado: el nombre de usuario admite cualquier email
  válido hasta el máximo del email (255 caracteres). El detalle técnico de la migración de
  datos corresponde al plan, no a la spec. (RF-7, RF-9)
- D-21. El cambio estructural autorizado en D-20 incluye además **materializar en los
  datos la unicidad del nombre de usuario**, que hoy solo está declarada en el modelo y no
  existe físicamente. Beneficio: la unicidad pasa a ser real y protege frente a altas
  simultáneas con el mismo email. Riesgo documentado: si en los datos actuales ya existen
  nombres de usuario repetidos, el cambio no podría aplicarse hasta depurarlos, y la
  garantía no existe mientras el cambio no esté aplicado. El detalle técnico corresponde
  al plan. (RF-17, «Límites conocidos»)
- D-22. La comprobación de «email ya registrado» es **insensible a mayúsculas y espacios**,
  tanto sobre el valor entrante (que además se normaliza antes de guardarse) como sobre
  los emails ya guardados, de modo que un dato histórico almacenado con mayúsculas o
  espacios no pueda esquivar el control y generar un duplicado. No se modifica ningún dato
  existente. (RF-17)
- D-23. **Corrección de la fuga de contraseña en las consultas de cuentas**, aprobada
  explícitamente por el usuario durante la verificación de esta feature: el listado de
  cuentas y la consulta de una cuenta concreta devolvían la contraseña almacenada, con lo
  que incumplían RNF-4 y el criterio (g). Se corrige **dentro de esta feature**: ambas
  respuestas dejan de exponer la contraseña en cualquier formato, conservando el resto de
  su contrato —datos de la cuenta y paginación del listado— y **sin ningún cambio en la
  estructura de los datos**. La contraseña sigue disponible para validar el inicio de
  sesión. La respuesta de la actualización de una cuenta presentaba la misma fuga; su
  corrección se aprobó después y se registra en D-24. (RF-24, RNF-4, criterios (g) y (o))
- D-24. **La corrección de D-23 alcanza también a la respuesta de la actualización de una
  cuenta**, aprobada explícitamente por el usuario: cuando el cuerpo de la actualización
  incluye la contraseña, la operación la protege y la guarda, pero **su respuesta deja de
  devolverla** —ni en texto plano ni protegida—, conservando el resto de la respuesta. Motivo:
  RNF-4 y el criterio (g) exigen que **ninguna** respuesta exponga la contraseña, y la
  actualización incumplía esa regla. Alcance: **no** cambia el contrato de entrada de la
  actualización (sigue admitiendo los mismos datos y conserva su comportamiento actual) ni la
  estructura de los datos; la contraseña sigue almacenándose de forma no recuperable y
  disponible para validar el inicio de sesión. (RF-24, RNF-4, criterios (g) y (o))
- D-25. **Valor por defecto de fecha para la creación de la cuenta**, segundo cambio
  estructural **autorizado explícitamente por el usuario** al cierre de la verificación: el
  alta devolvía la fecha de creación sin valor porque el origen de datos no la generaba,
  lo que contradecía RF-15 y el criterio (a). Se autoriza añadir un valor por defecto de
  fecha a la columna de fecha de creación de la cuenta, con el mismo procedimiento que
  D-20/D-21 (archivo versionado y aplicación manual, sin `synchronize` ni scripts de
  migración), de modo que **toda cuenta nueva traiga una fecha real**. Alcance: solo esa
  columna y solo su valor por defecto; **no** se rellena retroactivamente ninguna cuenta
  existente, no se cambia ningún otro tipo, columna ni restricción y no se toca la fecha del
  registro de cliente, que conserva su comportamiento actual. Nota: excepciona para esta
  columna de auditoría la regla general de no generar fechas en el origen de datos; la fecha
  sigue siendo un dato del sistema de datos y el backend no la calcula. (RF-15, criterio (a),
  «Límites conocidos»)
- D-26. **Retirada de la contraseña en las respuestas de asignaciones de rol**, aprobada
  explícitamente por el usuario durante el ciclo de corrección: el listado de asignaciones
  y la consulta de una asignación concreta entregaban la cuenta asociada completa, con su
  contraseña —incluso en texto plano en los datos sembrados—, lo que incumplía RNF-4 y el
  criterio (g) por una vía distinta de la de las cuentas (D-23 y D-24). Se corrige **dentro
  de esta feature**: la asignación conserva todos sus datos y su rol, y la cuenta asociada
  conserva identificador, nombre de usuario y fecha de creación, pero **nunca** su
  contraseña, ni en texto plano ni protegida; tampoco cambian la forma de consultar ni la
  paginación del listado, y **no hay cambio de esquema** (es una decisión de proyección).
  (RF-25, RNF-4, criterios (g) y (p))

## Dudas abiertas

**No hay dudas abiertas.** Las decisiones de negocio tomadas por el usuario están
registradas en la sección `Decisiones` (D-1 a D-26) y no queda ningún punto pendiente de
aclaración.
