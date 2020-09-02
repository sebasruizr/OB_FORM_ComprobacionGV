/*
Este archivo contiene todas las funciones del formulario de Comprobación de Gastos de Viaje y Gastos Varios.

El archivo HTML del Formulario esta asignado como eForm al DT GV - Comprobacion de Gastos.
	
	Se puede encontrar como SYS - HTML FORM con la KW Description "GV - COMPROBACION V 1.0 09052018", (se recomienda actualizar en este mismo archivo la ultima versión)
	El archivo fuente tambien se encuentra en la carpeta \Custom del directorio AppNet del WebServer de OnBase. \\172.16.2.76\CustomAppNet$\eFom_GV_Comprobacion_v1_0.html

La funcionalidad se cuentra en un archivo JS distinto principalmente por las siguientes razones:
	- Performance
	- Tamaño de archivos HTML en DiskGroups
	- Control
	- Poder llevar a cabo modificaciones sobre el JS sin tener que agregar a SYS HTML Forms de OnBase y/o crear revisiones del DT

En este archivo se encuentran definidos algunos catalogos duros de la siguiente manera:

=======================
Cat 1 Tipos Gastos
=======================
1 = HOSPEDAJE
2 = ALIMENTOS
3 = PASAJES LOCALES 	<- No utilizado
4 = AVION
5 = TAXI
6 = ESTACIONAMIENTO
7 = AUTOBUS
8 = GASOLINA
9 = PEAJE
10 = RENTA AUTO
11 = CONSUMOS LOCALES
12 = ESTACIONAMIENTO
13 = GASOLINA
14 = OTROS GASTOS
15 = PASAJES PLAZA
16 = TAXIS PLAZA
17 = AUTOS UTILITARIOS

=======================
Cat 2 Tipos Pago
=======================
1 = EFECTIVO
2 = TARJETA PERSONAL (DEBITO Y CREDITO)
3 = TARJETA EMPRESARIAL
4 = TARJETA EMPRESARIAL OTRO EMPLEADO		<- No utilizado

Es importante tener en consideración que esta definición de catalogos con sus ID's proviene desde el Portal, pasando por OnBase Workflow y AFKS.
POR LO QUE ES MUY PELIGROSO LLEVAR A CABO ALGUNA MODIFICACIÓN DE ESTOS.

Tambien se definen los catalogos de: Otros Gastos y de Autos Utilitarios.
*/

/*=======================
Control Versiones
=======================
Se muestran en la marca de agua al pie del Formulario 
02/05/2018 16:47 = Sebastian Ruiz - Original version liberada a GoLive 3-Marzo-2019
30/04/2019 18:41 = Oscar Ocampo - Ajuste JS para constrol de calculo IVA Acree y No Acree en TipoGasto 8 (Gasolina) si el calculo da mayor al IVA de la Factura y/o negativos
10/05/2019 18:41 = Sebastian Ruiz - Ajuste JS para discriminar los impuestos trasladados de la factura siempre igual a 002 correspondiente a IVA y omitir otros impuestos como IEPS
14/05/2019 16:08 = Sebastian Ruiz - Ajuste JS para controlar en Tipo Gastos 10 (Renta de Auto) si la factura tiene IVA en 0, no realice el calculo de IVA Acreditable por monto o porcentaje
*/
var versionJS = '02/09/2020 18:47 '; //Ultima modificación de este archivo JS 
var versionFormOB = 'V 1.0 09052018'; //Ultima versión del SYS HTML FORM asignado a DT en OnBase

//Los siguientes arrays son cargados en memoria en cada carga del formulario para control de las funciones de mas adelante
var counts = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0,13:0,14:0,15:0,16:0,17:0}; //arrays que llevarán la cuenta de las facturas generadas en el formulario por cada tipo de gasto
var errors = {0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0,13:0,14:0,15:0,16:0,17:0}; //arrays que serviran de acumulador de "errores" para el control del boton Guardar
var exists = {1:false,2:false,3:false,4:false,5:false,6:false,7:false,8:false,9:false,10:false,11:false,12:false,13:false,14:false,15:false,15:false,16:false,17:false}; //arrays booleanos para determinar si existo o no factura para cada tipo de gasto
var sums = {0:0.0,1:0.0,2:0.0,3:0.0,4:0.0,5:0.0,6:0.0,7:0.0,8:0.0,9:0.0,10:0.0,11:0.0,12:0.0,13:0.0,14:0.0,15:0.0,16:0.0,17:0.0}; //array para control de sumas es de montos de facturas por tipo de gasto para el desplegado al usuario autorizador 
var sumTotComp = 0.0, sumTotDed = 0.0, sumTotNoDed = 0.0, sumTotIVAAcre = 0.0, sumTotIVAnoAcre = 0.0; //variables para control en memoria de las sumas totales
//A continuación se crean en String los catalogos para ser usados como listas desplegables HTML mas adelante
var selectTpago = '	<option value="0"></option> \
					<option value="1">EFECTIVO</option> \
					<option value="2">TARJETA PERSONAL (DEBITO Y CREDITO)</option> \
					<option value="3">TARJETA EMPRESARIAL</option> \
					<option value="4">TARJETA EMPRESARIAL OTRO EMPLEADO</option>';
var selectTgasto = '<option value="0">NO UTILIZAR</option> \
					<option value="1">HOSPEDAJE</option> \
					<option value="2">ALIMENTOS</option> \
					<option value="3">PASAJES</option> \
					<option value="4">AVION</option> \
					<option value="5">TAXI</option> \
					<option value="6">ESTACIONAMIENTO</option> \
					<option value="7">AUTOBUS</option> \
					<option value="8">GASOLINA</option> \
					<option value="9">PEAJE</option> \
					<option value="10">RENTA AUTO</option> \
					<option value="11">CONSUMOS LOCALES</option> \
					<option value="12">ESTACIONAMIENTO</option> \
					<option value="13">GASOLINA</option> \
					<option value="14">OTROS GASTOS</option> \
					<option value="15">PASAJES PLAZA</option> \
					<option value="16">TAXIS PLAZA</option> \
					<option value="17">AUTOS UTILITARIOS</option>';
var selectOgastos = '<option value="0"></option> \
					<option value="01">COMPRA DE MEDICAMENTOS CLIENTES</option> \
					<option value="02">GASTOS Y SERVICIOS CONTRATACION DE PERSONAL</option> \
					<option value="03">EVENTOS</option> \
					<option value="04">IMPUESTOS ESTATALES Y MUNICIPALES</option> \
					<option value="05">DERECHOS VEHICULARES</option> \
					<option value="06">GASTOS APOYO PROMOCION DE VENTAS</option> \
					<option value="07">GASTOS DE EMBARQUE VARIOS</option> \
					<option value="08">COMBUSTIBLES DIESEL</option> \
					<option value="09">COMBUSTIBLES GASOLINA</option> \
					<option value="10">MATERIALES DE EMPAQUE</option> \
					<option value="11">COMBUSTIBLES GAS LP</option> \
					<option value="12">ACEITES Y LUBRICANTE</option> \
					<option value="13">SERVICIOS DE MENSAJERIA</option> \
					<option value="14">MATERIALES Y GASTOS DE LIMPIEZA, ASEO</option> \
					<option value="15">PAPELERIA Y ARTICULOS DE ESCRITORIO</option> \
					<option value="16">MANTENIMIENTO Y CONSERVACION EQUIPO DE ALMACEN</option> \
					<option value="17">MANTENIMIENTO Y CONSERVACION EQUIPO DE OFICINA</option> \
					<option value="18">MATERIALES Y HERRAMIENTAS MANTENIMIENTO VEHICULAR</option> \
					<option value="19">MANTENIMIENTO VEHICULAR</option> \
					<option value="20">GASTOS POR CUNSUMOS TRABAJO EXTRAORDINARIO</option> \
					<option value="21">GASTOS DE CAFETERIA</option> \
					<option value="22">BOTIQUIN PRIMEROS AUXILIOS</option> \
					<option value="23">GASTOS DE PREVISION SOCIAL</option> \
					<option value="24">GASTOS DE COMEDOR</option> \
					<option value="25">COMISIONES SERVICIOS NO FINANCIEROS</option> \
					<option value="26">CUOTAS y SUSCRIPCIONES</option> ';
var selectGautUti = '<option value="0"></option> \
					<option value="01">AUTO ARRENDADO</option> \
					<option value="02">AUTO UTILITARIO</option> \
					<option value="03">DERECHOS VEHICULARES</option> \
					<option value="04">AUTO ASIGNADO</option>';
// Declara algunas variables de control con ambito en todo el formulario
var readonly = 'readOnly'; //Determinara si el formulario es RedOnly, string para su uso en DOM de HTML
var disabled = 'disabled'; //Determinara si el formulario es RedOnly, string para su uso en DOM de HTML
var validaForm = ''; //Contedra valor despues de que el usuario guarde el Form, se hereda a KW en OnBase
var VistaSimple = false; //Determina si el formulario se mostrara en una vista simplificada, usada para el Autorizador 
var escribirKW = false; //Determina si la validación de Topes escribirán en KW's, cuando el Autorizador observa Warnings estos no se almacenan, para evitar que tenga que guardar explicitamente el formulario en OnBase
var KWmontoCompro; //Incrementara el monto total de comprobación por cada factura o comprobante procesado
var tipo;
var sumPropina = false;

/*=======================
Carga Pagina
=======================
Función se ejecuta siempre al cargar el formulario, es llamada desde el HTML en las ultimas lineas, esto para permitir la carga en el navegador de todos los valores de KW's
Acciones principales:
	- Muestra/Oculta la sección Oculta del Formulario
	- Muestra/Oculta la pagina de Gastos de Viaje o Gastos Varios (segun corresponda)
	- Habilita los botones a los usuarios de Contraloria para modificar el formulario
	- Aplica la vista simple para usuarios Autorizadores
	- Ejecuta las funciones para recorrer las KW's de Posiciones recorrerKWFact() y cargaMontosSumas()
 */
function cargaPagina()
{
	//Muestra versiones en marca de agua al pie del form
	document.getElementById('versionFormOB').innerHTML = 'versionFormOB = ' + versionFormOB;
	document.getElementById('versionJS').innerHTML = 'versionJS = ' + versionJS;
	//Obtiene valores de Kw's necesarios
	var tipoCompro = document.getElementById('OBKey__583_1').value;
	var usrActual = document.getElementById('OBProperty_CurrentUserName').value;
	var admin = tipoCompro.search(/ADMIN/i);
	var tViaje = tipoCompro.search(/VIAJE/i);
	var tVarios = tipoCompro.search(/VARIOS/i);
	//console.log(admin);
	//Muestra/Oculta secciones ocultas y de Pagina Gastos Viaje o Varios
	if(admin > 1)
	{
		if(usrActual == 'MANAGER' || usrActual == 'ADMIN' || usrActual == 'ADMINISTRATOR')
		{
			document.getElementById('ocultos').style.display = 'inline';
		}
	}
	if(tViaje > 1)
	{
		document.getElementById('paginaViaje').style.display = 'inline';
		document.getElementById('head_Viaje').style.display = 'inline';
		tipo = 'viaje';
	}
	if(tVarios > 1)
	{
		document.getElementById('paginaVarios').style.display = 'inline';
		document.getElementById('head_Viaje').style.display = 'none';
		tipo = 'varios';
	}
	//Despliega el Titulo del Formulario Gastos Viaje o Varios
	tipoCompro = tipoCompro.toLowerCase();
	var divTitulo = document.getElementById('tituloForm');
	divTitulo.innerHTML = 'Comprobación de ' + tipoCompro;
	var totNet = dosDecim(document.getElementById('OBKey__519_1').value);
	document.getElementById('totalComprobacion').value = totNet;
	document.getElementById('mto_totNet').innerHTML = totNet;
	//Obtiene KW Estatus Workflow
	var estatusWF = document.getElementById('OBKey__136_1').value;
	//Si el form esta en Contraloria, valida usuario logueados vs usuarios del Grupo para mostrar o no los botones Valida Reglas y Guardar
	if(estatusWF == 'COMPROBACION EN ANALISIS DE CONTRALORIA')
	{
		for(var w=1; w<=50; w++)
		{
			//Recorre los usuarios Asignados al Grupo de Contraloria, se encuentran en multi-instancias del KW SysUsers, que a su vez se obtienen de un AFKS External que consulta la tabla de asignación de usuarios de la BD de OnBase
			var userContraloria = document.getElementById('OBKey__645_'+w).value;
			//alert('usrActual: ' + usrActual + ' usrContraloria[w] :' + userContraloria + ' [' + w + ']');
			if(userContraloria!='')
			{
				if(usrActual==userContraloria)
				{
					//Si el usuario actual corresponde a un usuario del grupo de Contraloria o Manager, se muestran los botones ValidaReglas y Guardar, y todas las opciones del formulario disponibles para modificar se activan (readonly y disabled se desactivan)
					document.getElementById('botonSave1').style.display = 'inline';
					document.getElementById('botonSave2').style.display = 'inline';
					readonly = '';
					disabled = '';
					break;
				}
			}
			else
			{
				break;
			}
		}
	}
	//Si el form esta en Autorizador Manager, se ocultan elementos
	else if(estatusWF == 'COMPROBACION ESPERA APROBACION')
	{
		//Se define variable global VistaSimple como true para su uso posterior
		VistaSimple = true;
		sumPropina = true;
		document.getElementById('hd_Total').style.color = '#000000';
		document.getElementById('hd_IVA_NA').style.color = '#F5F5F5';
		document.getElementById('hd_IVA').style.color = '#F5F5F5';
		document.getElementById('hd_NoDed').style.color = '#F5F5F5';
		document.getElementById('hd_Ded').style.color = '#F5F5F5';
		for(var g=1; g<=2; g++)
		{
			document.getElementById('sumas_tipo'+g).style.display = 'none';
		}
	}

	//Se obtiene el Total Neto de la comprobación del KW o de memoria
	KWmontoCompro = document.getElementById('OBKey__519_1').value;
	if(KWmontoCompro!='') 
	{
		sumTotComp = parseFloat(KWmontoCompro);
	}

	//Ejecuta funcion para recorer KWTG Posiciones y Construir el cuerpo del Form
	recorrerKWFact();
	cargaMontosSumas();
	//Despues de construir el cuerpo del Form con todos los comprobantes, si se encuentra en Autorizador. Se realizará la validación de Reglas de Negocio y Topes Nadro unicamente sobre los tipo de gasto que si se incluyan en esta comprobación. Esto permitirá al Autorizador decidir si aprueba o no (en Workflow). 
	if(estatusWF == 'COMPROBACION ESPERA APROBACION')
	{
		for(var y=1; y<=16; y++)
		{
			if(exists[y])
			{
				//Llama funcion ValidaReglas solo de los tipos de gasto que si se encuentran presente en el Formulario. Nota: la variable escribirKW = false, por lo que no se hará ninguna modificación en KW's de OnBase, para evitar que el usuario Autorizador tenga que Guardar explicitamente el Formulario o le aparezca el msj "Desea Guardar los cambios?"
				validaReglas(y);
			}
		}
		if(tipo == 'viaje')
		{
			//Solo en caso de Gastos de Viaje, se realiza la validación de Reglas ID 0, que corresponde al monto en UMAS genera de una Comprobación para cada nivel de empleado A, B, C...	
			validaReglas('0');
		}
	}

	//Carga las alertas generales del formulario, correpondientes a la validación de Reglas ID 0, ya existentes en las KWs ReglaNoCumple
	for(var z=1; z<=3; z++)
	{
		//Recorre hasta 3 instancias del KW ReglaNoCumple, por lo que podrian desplegarse hasta 3 alertas generales
		var alertGral = document.getElementById('OBKey__622_'+z).value;
		if(alertGral!='')
		{
			//Se hace split del valor encontrado en la KW, el valor antes del pipe determina 1 o 0 que determina el tipo de alerta (color) y se envia como parametro de la funcion creaAlerta()
			var arrMsj = alertGral.split("|");
			creaAlerta('0', arrMsj[0], arrMsj[1]);
		}
	}

	//Para Vista siple, correspondiente al Autorizador, se muestran las sumas generales que fueron cargadas en memoria en el array sums[] al cargar el cuerpo del Formulario
	if(VistaSimple)
	{
		for(var g=1; g<=17; g++)
		{
			//alert('g='+g+' sum='+sums[g]);
			document.getElementById('mto_tipo'+g+'_tot').innerHTML = sums[g];
			sumTotComp += sums[g];
		}
		document.getElementById('mto_totNet').innerHTML = dosDecim(sumTotComp);
	}
}
/*=======================
Recorrer Keywords para construir cuerpo del Form
=======================
Funcion que recorre los campos de valores fuentes de KW para construir el cuerpo del Formulario y crear un registro por cada Factura (CFDI), Imagen o registro sin comprobante, se basa principalmente en el KWTG GV - Posiciones, el cual contiene un Record por cada comprobante, esta información fue previamente gestionada por Workflow.

Se utilizan los KWTG

	+ GV - Posiciones. Topado a 100 registros (Tope incluido en el portal)
			Contiene la información de cada Factura (CFDI), Comprobante Imagen o Registro sin comprobante (Para efectos posteriores cualquiera de estos tres lo denominaremos COMPROBANTE) ingresado por el usuario desde el Portal.
			Workflow se encarga de poblar este KWTG recorriendo cada DT FE - Factura XML y cada FE - Comprobante asociado al Folio. Llenando los campos iniciales como Hanlde, Tipo, RFC, UUID, Montos, Desgloces, Detalles, pagosTDC, etc.
			Este Formulario através de de las funciones sumaMontos() y validaReglas() se encarga de llenar los campos faltantes como: Deducibles, IVAsAcreditables, Remanente y ReglaNoCumple.
	+ FE - Concepto. Topado a 250 registros
			Contiene los datos provenientes de los tags Conceptos del XML del CFDI. Aplica unicamente a comprobantes de tipo factura CFDI.
			El campo Handle del KWTG GV - Posiciones se relaciona uno a muchos en este KWTG con el mismo campo Handle.
	+ FE - Traslados. Topado a 150 registros
			Contiene los datos provenientes de los tags de impuestos del XML del CFDI. Aplica unicamente a comprobantes de tipo factura CFDI.
			El campo Handle del KWTG GV - Posiciones se relaciona uno a muchos en este KWTG con el mismo campo Handle.
 */
function recorrerKWFact()
{
	for (var i=1; i<=100; i++) 
	{
		// Se recorrera un maximo de 100 veces para obtener los datos de cada comprobante, inicialmente obteniendo el campo Handle, el cual determinará que existe o no el registro, razón por la cual si este valor se encuentra vacio detenemos el proceso de seguir recorriendo los demas registros.
		var handle = document.getElementById('OBKey__565_'+i).value;
		if(handle != '')
		{
			//Obtiene todos los campos principales de cada comprobante que serán utilizados para mostrar en el Form o tomar deciciones
			var tipoGasto = document.getElementById('OBKey__580_'+i).value; //ID del tipo de gasto del comprobante (1 al 17)
			var tipoFact = document.getElementById('OBKey__566_'+i).value; //Determina si es CFDI, Concepto de CFDI (CCFDI), imagen (IMG) o registro sin comprobante (SCOMP)
			var SerieFolio = document.getElementById('OBKey__573_'+i).value; //Serie y folio del CFDI proveniente del XML o bien construido con un consecutivo por Workflow 
			var rfc = document.getElementById('OBKey__574_'+i).value; //RFC del CFDI proveniente del XML o definido con valor Dummy por Workflow
			var provee = document.getElementById('OBKey__575_'+i).value; //Nombre del proveedor proveniente del XML del CFDI
			var uuid = document.getElementById('OBKey__576_'+i).value; //UUID del CFDI provniente del XML
			var tipoPago = document.getElementById('OBKey__577_'+i).value; //Tipo de pago principal, definido por Workflow de acuerdo con el monto mayor desglosado en los tipos de pago capturados por el usuario en el portal (Efectivo, Tarjeta Personal o TDC Empresarial)
			var subtotal = dosDecim(document.getElementById('OBKey__584_'+i).value); //Subtotal del CFDI proveniente del XML 
			var total = dosDecim(document.getElementById('OBKey__585_'+i).value); //Total del CFDI proveniente del XML o capturado por el usuario en IMG y SCOMP
			var fecha = document.getElementById('OBKey__589_'+i).value; //Fecha del CFDI proveniente del XML o capturado por el usuario en IMG y SCOMP
			var detalleGasto = document.getElementById('OBKey__593_'+i).value; //Contiene concatenados los datos adicionales para cada tipo de pago capturados por el usuario en el portal, por ejemplo en Hospedaje, la cantidad de noches hospedadas, algunos casos contienen mas de un datoe concatenados por un guion medio (-)
			var desgloce = document.getElementById('OBKey__618_'+i).value; // En comprobantes CFDI que tienen mas de un conceptos, si el usuario separo desde el portal el tipo de gasto por concepto, este campo contendrá concatenados los ID's de conceptos junto a sus ID's de tipo de gasto seleccionados por el usuario 
			var ReglaNocump = document.getElementById('OBKey__621_'+i).value; //Si este campo se encuentra lleno, significa que los proceso de validación de reglas y topes ya sucedio, por lo que será utilizado para mostrar Warnings desde la carga del formulario. Caso contrario, este campo será llenado con la función validaReglas() si es que el comprobante supera alguna regla de negocio
			var ded = dosDecim(document.getElementById('OBKey__623_'+i).value); //Determina que cantidad del SubTotal del gasto corresponde a Deducible, se llena con la función sumaMontos()
			var noDed = dosDecim(document.getElementById('OBKey__624_'+i).value); //Determina que cantidad del SubTotal del gasto corresponde a No Deducible, se llena con la función sumaMontos()
			var iva = dosDecim(document.getElementById('OBKey__625_'+i).value); //Determina que cantidad del IVA del gasto corresponde a Acreditable (solo en CFDI), se llena con la función sumaMontos()
			var noIva = dosDecim(document.getElementById('OBKey__626_'+i).value); //Determina que cantidad del IVA del gasto corresponde a No Acreditable (solo en CFDI), de acuerdo con los Topes Fiscales establecidos provenientes del KWTG GV - Cat Tope Nadro/Fiscales, que a su vez proviene de un AFSK. Se llena con la función sumaMontos()
			var impLoc = dosDecim(document.getElementById('OBKey__627_'+i).value); //Contiene el cantidad que se asume como un impuesto local, normalmente es igual al Remanente, el cual se obtiene de la operación (TotalNeto - (SubTotal + IVA)), solo en CFDI.
			var serv = dosDecim(document.getElementById('OBKey__628_'+i).value); //COntiene la cantidad dada como propina, fue captura por el usuario desde el portal
			var remanente = dosDecim(document.getElementById('OBKey__638_'+i).value); //Se obtiene de la operación (TotalNeto - (SubTotal + IVA)), solo en CFDI. Y sera considerada como una posición al contabilizar etiquetada como REMANENTE
			var pEfect = dosDecim(document.getElementById('OBKey__665_'+i).value); //Contiene la cantidad pagada en efectivo capturada por el usuario en el portal
			var pTDCpers = dosDecim(document.getElementById('OBKey__666_'+i).value); //Contiene la cantidad pagada con Tarjeta de Debito o Credito Personal capturada por el usuario en el portal
			var pTDCcorp = dosDecim(document.getElementById('OBKey__667_'+i).value); //Contiene la cantidad pagada con Tarjeta de Credito Corporativa de Nadro capturada por el usuario en el portal
			var pTDCcorpOE = dosDecim(document.getElementById('OBKey__668_'+i).value); //Originalmente contendria la cantidad pagada con Tarjeta de Credito Corporativa de Nadro de Otro Empleado, capturada por el usuario en el portal 				<- No utilizado
			//Inicializamos algunas variables que serán utilizadas en el entorno de esta función 
			var importraslad = 0.0;
			var tasatraslad;
			var impuetraslad;
			var cantItems = 0;

			sums[tipoGasto] = sums[tipoGasto] + parseFloat(total); //Suma en el array acumulador del tipo de gasto, el monto total de la factura en curso
			//if(sumPropina)
			//{
				sums[tipoGasto] = sums[tipoGasto] + parseFloat(serv);
			//}

			//En caso de existir previamente en la KW ReglaNoCumple de cada comprobante un valor, se creará visualmente en el Formulario la Alerta dentro de la sección del Tipo de Gasto en curso (elemento del HTML id=alert_tipo[x], donde X es el ID del tipo de gasto 1 al 17 )
			if(ReglaNocump!='')
			{
				//Se hace split del valor encontrado en la KW, el valor antes del pipe determina 1 o 0 que determina el tipo de alerta (color) y se envia como parametro de la funcion creaAlerta()
				var arrMsj = ReglaNocump.split("|");
				creaAlerta(tipoGasto, arrMsj[0], arrMsj[1]);
			}

			//Valida si el tipo de comprobante es CFDI
			if (tipoFact == 'CFDI')
			{
				//Obtiene los impuestos del KWTG Trasladados, buscando el mismo Handle
				for(var k=1; k<=150; k++)
				{
					var handleTraslad = document.getElementById('OBKey__586_'+k).value;
					if(handleTraslad != '')
					{
						if(trim(handle) == trim(handleTraslad))
						{
							impuetraslad = document.getElementById('OBKey__186_'+k).value;
							if(trim(impuetraslad) == '002') // Evalua que el impuesto sea = 002 correspondiente a IVA en el CFDI segun SAT
							{
								//Una vez encontrados los almacena en variables del entorno de la función para ser enviados como parametros en las funciones siguientes
								importraslad += parseFloat(dosDecim(document.getElementById('OBKey__188_'+k).value));
								tasatraslad = document.getElementById('OBKey__187_'+k).value;
							}
						}
					}
					else
					{
						break;
					}
				}
				//Llama funcion para crear un registro de comprobante factura (CFDI) en la estructura grafica del formulario, pasando como parametros todos los datos necesarios provenientes del KWTG GV - Posiciones y FE - Trasladados
				creaFactCFDI(tipoGasto, i, tipoFact, detalleGasto, SerieFolio, rfc, provee, uuid, tipoPago, fecha, subtotal, total, importraslad, ded, noDed, iva, noIva, impLoc, serv, desgloce, handle, remanente, pEfect, pTDCpers, pTDCcorp, pTDCcorpOE);
				
				//Obtiene en variable la cantidad de comprobantes que existen para el tipo de gasto en curso, este valor fue asignado dentro de la función anterior creaFactCFDI()
				countFact = counts[tipoGasto];
				//Indica en la bandera del array en memoria que el tipo de gasto si contiene al menos un comprobante
				exists[tipoGasto] = true;

				//Recorre el KWTG FE - Conceptos un maximo de 250 veces, tomando como base el Handle comparandolo vs el Hanlde del comprobante en curso 
				for(var r=1; r<=250; r++)
				{
					var handleConcept = document.getElementById('OBKey__572_'+r).value;
					//console.log('iteradorConcepto r = '+r+' handleConcept: ' + handleConcept);
					if(handleConcept != '')
					{
						if(handle == handleConcept)
						{
							//Una vez encontrado un Record con el mismo Handle que la factura, se carga en memoria con ambito local
							var cant = document.getElementById('OBKey__192_'+r).value;
							var descrip = document.getElementById('OBKey__571_'+r).value;
							var pu = dosDecim(document.getElementById('OBKey__196_'+r).value);
							var importe = dosDecim(document.getElementById('OBKey__195_'+r).value);
							var impuesto = dosDecim(document.getElementById('OBKey__504_'+r).value);
							var tipoGastoConc = document.getElementById('OBKey__620_'+r).value;

							//Se determina el ID para la tabla HTML que será creada dentro de cada factura, la cual se compone de tipo de gasto y el iterador de factura que se encuentr en curso
							var idtable = tipoGasto+'tabFact'+countFact;
							//console.log('idtable: ' + idtable);
							//Se llama la función creaRowFact() por cada Record de concepto encontrado, para que se cree el row correspondiente dentro de cada registro de factura creado previamente con la función creaFactCFDI(), el valor de idtable es el que determina que tabla HTML debera afectar. Y se envian los demas datos del KWTG FE - Concepto necesarios para crear el registro
							creaRowFact(idtable, r, cant, descrip, pu, importe, impuesto, tipoGasto, tipoGastoConc);
							//Se incrementa la cantidad de conceptos encontrados del comprobante factura CFDI en curso.
							cantItems ++;
						}
					}
					else
					{
						break;
					}
				}
				//Una vez terminado de recorrer todos los Records, tomamos el valor de cantItems que corresponde a la cantidad de conceptos de la factura en curso y se almacena en un campo del HTML del form para su posterior uso
				document.getElementById('tipo'+tipoGasto+'_fact'+countFact+'_cantItems').value = cantItems;
			}
			//Valida si el tipo de comprobante es una imagen (IMG) o un registro sin comprobante (SCOMP)
			else if((tipoFact == 'IMG') || (tipoFact == 'SCOMP'))
			{
				//Llama funcion para crear un registro de comprobante imagen (IMG) en la estructura grafica del formulario, pasando como parametros todos los datos necesarios provenientes del KWTG GV - Posiciones
				creaFactIMG(tipoGasto, i, tipoFact, detalleGasto, SerieFolio, rfc, fecha, total, tipoPago, ded, noDed, iva, noIva, impLoc, serv, handle, remanente, pEfect, pTDCpers, pTDCcorp, pTDCcorpOE);
				//Indica en la bandera del array en memoria que el tipo de gasto si contiene al menos un comprobante
				exists[tipoGasto] = true;
			}
			//Valida si el tipo de comprobante es un concepto separado de una factura CFDI Original. Esta función corresponde la opción del usuario solicitante en el portal de poder indicar que uno o varios conceptos de una misma factura corresponden a distintos tipos de gastos, por ejemplo una factura de Hospedaje que incluye alimentos o estacionamiento. La decisión de crear un Record en el KWTG GV - Posiciones para estos casos la determina Workflow. 
			else if(tipoFact == 'CCFDI')
			{
				//Llama funcion para crear un registro de comprobante concepto de CFDI en la estructura grafica del formulario, pasando como parametros todos los datos necesarios provenientes del KWTG GV - Posiciones
				creaConcptCFDI(tipoGasto, i, tipoFact, detalleGasto, SerieFolio, rfc, provee, uuid, tipoPago, fecha, subtotal, total, ded, noDed, iva, noIva, impLoc, serv, desgloce, handle, remanente);
				//Indica en la bandera del array en memoria que el tipo de gasto si contiene al menos un comprobante
				exists[tipoGasto] = true;
			}
		}
		else
		{
			break;
		}
	}
}
/*=======================
Crea graficamente un registro de Factura CFDI en el cuepor del Form
=======================
Función que se manda a llamar desde la función recorrerKWFact() por cada Comprobante de tipo CFDI que contenga la comprobación en curso. Recibe todos los datos necesarios para crear el registro provenientes de los KWTG GV - Posiciones y FE - Trasladados
 */
function creaFactCFDI(tipoGasto, i, tipoFact, detalleGasto, SerieFolio, rfc, provee, uuid, tipoPago, fecha, subtotal, total, importraslad, ded, noDed, iva, noIva, impLoc, serv, desgloce, handle, remanente, pEfect, pTDCpers, pTDCcorp, pTDCcorpOE)
{
	counts[tipoGasto]++; //Se incrementa en el array en Memoria que el tipo de Gasto contiene un comprobante mas de su tipo de gasto
	countFact = counts[tipoGasto]; //Obtiene el numero actual de Comprobantes que contiene el tipo de gastos (incluyendo la que esta en curso), este sera el ID de los elementos HTML que se construyan para este comprobante

	//Se llama función para determinar las caracteristicas particulares del tipo de gasto, por ejemplo en Hospedaje se requiere un campo "Cant Noches" el cual se obtiene a su vez del KW Pos_DetalleGasto que se incluye en el KWTG GV - Posiciones, por lo que esta función retornara un String con el contenido de codigo HTML de los campos y caracteristicas particulares de cada Tipo de gasto, incluyendo ya los valores correspondientes a cada campo. Este Str será concatenado mas adelante.
	var definehtml = defineCarctrtcs(tipoGasto, countFact, detalleGasto, tipoFact, impLoc, serv, VistaSimple);

	//Se crea el elmento HTML en el DOM de la pagina para crear el comprobante Factura CFDI dentro de su caja correspondiente facts_tipo[x] donde x es el ID del tipo de gasto
	var p = document.getElementById('facts_tipo' + tipoGasto);
    var newElement = document.createElement('div');
    newElement.setAttribute('id', 'div_tipo' + tipoGasto + 'No_' + countFact);
    p.appendChild(newElement);

    //console.log('tipoGasto=' + tipoGasto + ' counts=' + counts[tipoGasto]);

    //Se construye en un String el HTML para la factura CFDI, incluyendo los ID's de cada elemento y los valores que contendrá como UUID, RFC, Montos, etc.
	var strHTML = ' \
		<div class="panel panel-default"> \
		  	<!-- \
			Encabezado Panel Factura \
			--> \
		    <div class="panel-heading" style="background-color: #BCDBA4;"> \
		      <h4 class="panel-title"> \
		        <a data-toggle="collapse" data-parent="#body_tipo'+tipoGasto+'" href="#collapse_tipo'+tipoGasto+'_No'+countFact+'"> \
		        Factura '+tipoFact+' ' + SerieFolio + '</a> \
		      </h4> \
		    </div> \
		    <!-- \
			Contenido Factura \
			--> \
		    <div id="collapse_tipo'+tipoGasto+'_No'+countFact+'" class="panel-collapse collapse"> \
			    <div class="panel-body"> \
					<div class="elementOculto"> \
						<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_handle"  value="'+handle+'" /> \
						<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_seriefol"  value="'+SerieFolio+'" /> \
						<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_tipoFact" value="'+tipoFact+'" /> \
						<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_desgloce" value="'+desgloce+'" /> \
						<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_cantItems" value="" /> \
						<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_remamente" value="'+remanente+'" /> \
					</div> \
					<div class="col-sm-4"> \
						<div class="input-group input-group-sm"> \
						<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">RFC</span> \
						<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_rfc" class="form-control" readonly value="'+rfc+'" /> \
						</div> \
					</div> \
					<div class="col-sm-4"> \
						<div class="input-group input-group-sm"> \
						<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">Serie/Folio</span> \
						<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_fol" class="form-control" readonly value="'+SerieFolio+'" /> \
						</div> \
					</div> \
					<div class="col-sm-4"> \
						<div class="input-group input-group-sm"> \
						<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">Fecha</span> \
						<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_fecha" class="form-control" readonly value="'+fecha+'" /> \
						</div> \
					</div> \
					<div class="col-sm-4"> \
						<div class="input-group input-group-sm"> \
						<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">UUID</span> \
						<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_uuid" class="form-control" readonly value="'+uuid+'" /> \
						</div> \
					</div> \
					<div class="col-sm-4"> \
						<div class="input-group input-group-sm"> \
						<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">Proveedor</span> \
						<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_prov" class="form-control" readonly value="'+provee+'" /> \
						</div> \
					</div> \
					<!-- \
					Contenido Factura Tabla de Detalle por concepto \
					--> \
			      	<table class="table" id="'+tipoGasto+'tabFact'+countFact+'"> \
					    <thead> \
					      <tr> \
					      	<th class="col-md-1">Cantidad</th> \
					        <th class="col-md-4">Concepto</th> \
					        <th class="col-md-2">TipoGasto</th>\
					        <th class="col-md-1 aligRight">PU</th> \
					        <th class="col-md-1 aligRight">IVA</th> \
					        <th class="col-md-1 aligRight">Total</th> \
					      </tr> \
					    </thead> \
					    <tbody> \
					      \
					      <tr> \
					      	<td> \
					        </td> \
					        <td> \
					        </td> \
					        <td> \
				        	</td> \
					        <td colspan="2" class="tdLabel aligRight"> \
					        	Subtotal CFDI \
					        </td> \
					        <td colspan="2"> \
					        	<div class="input-group input-group-sm"> \
					        		<input class="form-control aligRight" type="text" readonly id="tipo'+tipoGasto+'_fact'+countFact+'_subtotFact" value="'+subtotal+'" /> \
					        	</div> \
					        </td> \
					      </tr> \
					      <tr style="border-style: hidden;"> \
					      	<td> \
					        </td> \
					        <td> \
					        </td> \
					        <td> \
				        	</td> \
					        <td colspan="2" class="tdLabel aligRight"> \
					        	IVA CFDI \
					        </td> \
					        <td > \
					        	<div class="input-group input-group-sm"> \
					        		<input class="form-control aligRight" type="text" readonly id="tipo'+tipoGasto+'_fact'+countFact+'_ivaFact" value="'+importraslad+'" /> \
					        	</div> \
					        </td> \
					      </tr> \
					      <tr style="border-style: hidden;"> \
					      	<td> \
					        </td> \
					        <td> \
					        </td> \
					        <td> \
				        	</td> \
					        <td colspan="2" class="tdLabel aligRight"> \
					        	Total CFDI \
					        </td> \
					        <td > \
					        	<div class="input-group input-group-sm"> \
					        		<input class="form-control aligRight" type="text" readonly id="tipo'+tipoGasto+'_fact'+countFact+'_totFact" value="'+total+'" /> \
					        	</div> \
					        </td> \
					      </tr> \
					    </tbody> \
				  	</table> \
				  	\
				  	<div class="row"> \
					  	<div class="col-sm-4"> \
							<div class="input-group input-group-sm"> \
								<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">TipoPago Principal</span> \
								<select class="form-control" disabled style="cursor: default;" id="tipo'+tipoGasto+'_fact'+countFact+'_tPago"> \
								'+selectTpago+ '</select> \
							</div>';
		if(VistaSimple == false) //Si la variable Global VistaSimple esta activa se omite la creación de los siguientes elementos, VistaSimple esta activa normalmente para la aprobación del Autorizador
		{
			strHTML +=' \
							<div class="input-group input-group-sm"> \
								<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">Efectivo</span> \
								<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_pEfect" class="form-control" readonly value="'+pEfect+'" /> \
							</div> \
							<div class="input-group input-group-sm"> \
								<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">TDC Personal</span> \
								<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_pTpers" class="form-control" readonly value="'+pTDCpers+'" /> \
							</div> \
							<div class="input-group input-group-sm"> \
								<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">TDC Corporativa</span> \
								<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_pTcorp" class="form-control" readonly value="'+pTDCcorp+'" /> \
							</div> \
							<div class="input-group input-group-sm elementOculto"> \
								<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">TDC Corp OtroEmplead</span> \
								<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_pTcorpOE" class="form-control" readonly value="'+pTDCcorpOE+'" /> \
							</div> \
						</div> \
						<div class="col-sm-4"> \
							<div class="input-group input-group-sm"> \
								<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">Deducible 16%</span> \
								<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_ded" class="form-control" readonly value="'+ded+'" /> \
							</div> \
							<div class="input-group input-group-sm"> \
								<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">No Deducible 16%</span> \
								<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_noded" class="form-control" readonly value="'+noDed+'" /> \
							</div> \
							<div class="input-group input-group-sm"> \
								<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">IVA Acreditable 16%</span> \
								<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_ivaAcre" class="form-control" readonly value="'+iva+'" /> \
							</div> \
							<div class="input-group input-group-sm"> \
								<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">IVA No Acreditable 16%</span> \
								<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_ivaNoAcre" class="form-control" readonly value="'+noIva+'" /> \
							</div> \
							<div class="input-group input-group-sm"> \
								<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">Deducible 8%</span> \
								<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_ded8" class="form-control" readonly value="'+ded+'" /> \
							</div> \
							<div class="input-group input-group-sm"> \
								<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">No Deducible 8%</span> \
								<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_noded8" class="form-control" readonly value="'+noDed+'" /> \
							</div> \
							<div class="input-group input-group-sm"> \
								<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">IVA Acreditable 8%</span> \
								<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_ivaAcre8" class="form-control" readonly value="'+iva+'" /> \
							</div> \
							<div class="input-group input-group-sm"> \
								<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">IVA No Acreditable 8%</span> \
								<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_ivaNoAcre8" class="form-control" readonly value="'+noIva+'" /> \
							</div> \
							<div class="input-group input-group-sm"> \
								<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">Deducible 0%</span> \
								<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_ded0" class="form-control" readonly value="'+ded+'" /> \
							</div> \
							<div class="input-group input-group-sm"> \
								<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">No Deducible 0%</span> \
								<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_noded0" class="form-control" readonly value="'+noDed+'" /> \
							</div> \
							<div class="input-group input-group-sm"> \
								<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">IVA Acreditable 0%</span> \
								<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_ivaAcre0" class="form-control" readonly value="'+iva+'" /> \
							</div> \
							<div class="input-group input-group-sm"> \
								<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">IVA No Acreditable 0%</span> \
								<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_ivaNoAcre0" class="form-control" readonly value="'+noIva+'" /> \
							</div> \
						</div> ';
		}
		else
		{
			strHTML +='	</div>';
		}
		//Se concatena el String construido en las lineas anteriores y el definido en la función defineCarctrtcs()
		strHTML += definehtml +'\
					</div> \
		      	</div> \
		    </div> \
		</div>';
		//Se incrusta el String final contruido al DOM
		newElement.innerHTML = strHTML;
	//Los campos de tipo  catalogo como selectTpago, selectTgasto, selectOgastos, selectGautUti para este punto fueron declarados en el DOM, a continuación se determina su valor con base en lo proveniente de la KW que corresponda
	document.getElementById('tipo'+tipoGasto+'_fact'+countFact+'_tPago').selectedIndex = tipoPago; // Determina el catalogo selectTpago
	if(tipoGasto==14)
	{
		var num = 0;
		num = parseInt(detalleGasto);
		//alert(num);
		document.getElementById('tipo'+tipoGasto+'_fact'+countFact+'_tOgasto').selectedIndex = num; //Determina el catalogo selectOgastos solo para el tipo de gasto Otros Gastos (Id 14)
	}
	else if(tipoGasto==17)
	{
		if(detalleGasto=='') detalleGasto = '0-0';
		detalles = detalleGasto.split('-');
		document.getElementById('tipo'+tipoGasto+'_fact'+countFact+'_tAutUti').selectedIndex = detalles[0]; //Determina el catalogo selectGautUti solo para el tipo de gasto Autos utilitarios (Id 17), ademas que se obtiene de la separación del campo detalleGastos en la posición 0 del split por guion medio (-)
	}
}
/*=======================
Crea graficamente un Row en la tabla de conceptos de cada factura CFDI
=======================
Función que se manda a llamar desde la función recorrerKWFact() por cada Concepto del CFDI encontrado en el KWTG FE - Conceptos
 */
function creaRowFact(tabFact, r, cant, descrip, pu, importe, impuesto, tipoGasto, tipoGastoConc) 
{
	//console.log('entro al row, r= '+r);
    var table = document.getElementById(tabFact); //Determina cual de todas las tablas ya construidas en el DOM se va a alterar. tabFact proviene del ID para el elementos definido en la función recorrerKWFact()
    var tbCount = document.getElementById(tabFact).rows.length; //Obtiene cuantos Rows contiene actualmente la tabla
    tbCount = tbCount - 3; //Resta las ultimas 3 posiciones que corresponden a los campos Subtota, IVA y Total de toda la factura
    var color;
    var strTipoGasto;

    var row = table.insertRow(tbCount); //Crea un Row en la tabla en la ultima posición restados los 3 mencionados antes
    if((tipoGastoConc!=tipoGasto)&&(tipoGastoConc!="")) //Valida si el tipo de gaso del Concepto en curso es distinto al tipo de gasto de toda la factura y que este No se encuentra vacio, el tipo de gasto a nivel concepto proviene de la KW Concepto_TipoGasto del KWTG FE - Concepto
	{
		//row.style.backgroundColor='#EEEEEE';
		if(tipoGastoConc=="X") //Se evalua si el valor es "X", lo cual significa que fue un concepto explicitamente eliminado de la comprobación por el usuario desde el portal, por lo que se establece en "0" para tomar dicho index del catalogo selectTgasto que significa "NO UTILIZAR"
		{
			tipoGastoConc = 0;
		}
	}
	else
	{
		//Caso contrario se asume que el concepto es parte de la factura y se sobre-escribe al Tipo de Gasto principal de la factura
		tipoGastoConc = tipoGasto;
	}
	//Se crean las celdas para la tabla en el Row previamente creado
    var cell0 = row.insertCell(0);
    var cell1 = row.insertCell(1);
    var cell2 = row.insertCell(2);
    var cell3 = row.insertCell(3);
    var cell4 = row.insertCell(4);
    var cell5 = row.insertCell(5);

    //alert('tipo'+tipoGasto+'_fact'+countFact+'_item'+r+'_tGasto');

    //Se crean los Strings con el HTML, y valores de cada celda y se insertan al DOM
    cell0.innerHTML = '<div class="input-group input-group-sm"> \
			        		<input class="form-control" type="text" readonly id="tipo'+tipoGasto+'_fact'+countFact+'_item'+r+'_cant" value="'+cant+'" /> \
			        	</div>'; 
    cell1.innerHTML = '<div class="input-group input-group-sm width100"> \
			        		<input class="form-control" type="text" readonly id="tipo'+tipoGasto+'_fact'+countFact+'_item'+r+'_cpto" value="'+descrip+'" /> \
			        	</div>';
	cell2.innerHTML = '<select class="form-control" style="cursor: default;" disabled id="tipo'+tipoGasto+'_fact'+countFact+'_item'+r+'_tGasto"> \
						'+selectTgasto+ '</select> ';
    cell3.innerHTML = '<div class="input-group input-group-sm"> \
			        		<input class="form-control aligRight" type="text" readonly id="tipo'+tipoGasto+'_fact'+countFact+'_item'+r+'_pu" value="'+pu+'" /> \
			        	</div>';
    cell4.innerHTML = '<div class="input-group input-group-sm"> \
			        		<input class="form-control aligRight" type="text" readonly id="tipo'+tipoGasto+'_fact'+countFact+'_item'+r+'_iva" value="'+impuesto+'" /> \
			        	</div>';
    cell5.innerHTML = '<div class="input-group input-group-sm"> \
			        		<input class="form-control aligRight" type="text" readonly id="tipo'+tipoGasto+'_fact'+countFact+'_item'+r+'_tot" value="'+importe+'" /> \
			        	</div>';
	//E campo de tipo  catalogo selectTpago para este punto fue declarado en el DOM, a continuación se determina su valor con base en lo proveniente de la KW
	document.getElementById('tipo'+tipoGasto+'_fact'+countFact+'_item'+r+'_tGasto').selectedIndex = tipoGastoConc; // Determina el catalogo selectTpago
}
/*=======================
Crea graficamente un registro de comprobante Imagen (IMG) o sin comprobante (SCOMP) en el cuepor del Form
=======================
Función que se manda a llamar desde la función recorrerKWFact() por cada Comprobante de tipo IMG o SCOMP que contenga la comprobación en curso. Recibe todos los datos necesarios para crear el registro provenientes de los KWTG GV - Posiciones
 */
function creaFactIMG(tipoGasto, i, tipoFact, detalleGasto, SerieFolio, rfc, fecha, total, tipoPago, ded, noDed, iva, noIva, impLoc, serv, handle, remanente, pEfect, pTDCpers, pTDCcorp, pTDCcorpOE)
{
	counts[tipoGasto]++; //Se incrementa en el array en Memoria que el tipo de Gasto contiene un comprobante mas de su tipo de gasto
	countFact = counts[tipoGasto]; //Obtiene el numero actual de Comprobantes que contiene el tipo de gastos (incluyendo la que esta en curso), este sera el ID de los elementos HTML que se construyan para este comprobante

	//Se llama función para determinar las caracteristicas particulares del tipo de gasto, por ejemplo en Hospedaje se requiere un campo "Cant Noches" el cual se obtiene a su vez del KW Pos_DetalleGasto que se incluye en el KWTG GV - Posiciones, por lo que esta función retornara un String con el contenido de codigo HTML de los campos y caracteristicas particulares de cada Tipo de gasto, incluyendo ya los valores correspondientes a cada campo. Este Str será concatenado mas adelante.
	var definehtml = defineCarctrtcs(tipoGasto, countFact, detalleGasto, tipoFact, impLoc, serv, VistaSimple);

	//Se crea el elmento HTML en el DOM de la pagina para crear el comprobante Factura CFDI dentro de su caja correspondiente facts_tipo[x] donde x es el ID del tipo de gasto
	var p = document.getElementById('facts_tipo' + tipoGasto);
    var newElement = document.createElement('div');
    newElement.setAttribute('id', 'div_tipo' + tipoGasto + 'No_' + countFact);
    p.appendChild(newElement);

    //Se construye en un String el HTML para el registro IMG o SCOMP, incluyendo los ID's de cada elemento y los valores que contendrá como RFC, Montos, etc.
	var strHTML = ' \
		<div class="panel panel-default"> \
			<!-- \
			Encabezado Panel Comprobante Impreso \
			--> \
		    <div class="panel-heading" style="background-color: #BCDBA4;"> \
		      <h4 class="panel-title"> \
		      	<a data-toggle="collapse" data-parent="#body_tipo'+tipoGasto+'" href="#collapse_tipo'+tipoGasto+'_No'+countFact+'"> \
		        '+tipoFact + ' ' + SerieFolio + ' </a> \
		      </h4> \
		    </div> \
		    <!-- \
			Contenido Comprobante Impreso \
			--> \
			<div class="elementOculto"> \
				<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_handle"  value="'+handle+'" /> \
				<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_seriefol"  value="'+SerieFolio+'" /> \
				<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_tipoFact" value="'+tipoFact+'" /> \
				<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_cantItems" value="" /> \
				<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_desgloce" value="" /> \
				<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_remamente" value="'+remanente+'" /> \
			</div> \
		    <div id="collapse_tipo'+tipoGasto+'_No'+countFact+'" class="panel-collapse collapse"> \
				<div class="panel-body"> \
					<!-- \
					Contenido Comprobante Impreso \
					--> \
					<div class="row"> \
						<div class="col-sm-4"> \
							<div class="input-group input-group-sm"> \
								<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">RFC</span> \
								<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_rfc" class="form-control" readonly value="'+rfc+'" /> \
							</div> \
						</div> \
						<div class="col-sm-4"> \
							<div class="input-group input-group-sm"> \
								<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">Fecha</span> \
								<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_fecha" class="form-control" readonly value="'+fecha+'" /> \
							</div> \
						</div> \
						<div class="col-sm-4"> \
							<div class="input-group input-group-sm"> \
								<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">Importe</span> \
								<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_subtotFact" class="form-control" readonly value="'+total+'" /> \
							</div> \
						</div> \
						<div id="tipo'+tipoGasto+'_fact'+countFact+'_DivImpIMG" class="elementOculto"> \
							<div class="col-sm-4"> \
								<div class="input-group input-group-sm"> \
									<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">IVA</span> \
									<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_ivaFact" class="form-control" readonly value="0" /> \
								</div> \
							</div> \
							<div class="col-sm-4"> \
								<div class="input-group input-group-sm"> \
									<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">Total</span> \
									<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_totFact" class="form-control" readonly value="0" /> \
								</div> \
							</div> \
						</div> \
					</div> <hr/> \
					<div class="row"> \
						<div class="col-sm-4"> \
							<div class="input-group input-group-sm"> \
								<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">TipoPago Principal</span> \
								<select class="form-control" disabled style="cursor: default;" id="tipo'+tipoGasto+'_fact'+countFact+'_tPago"> \
								'+selectTpago+ '</select> \
							</div> ';
	if(VistaSimple == false) //Si la variable Global VistaSimple esta activa se omite la creación de los siguientes elementos, VistaSimple esta activa normalmente para la aprobación del Autorizador
	{
			strHTML += ' \
							<div class="input-group input-group-sm"> \
								<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">Efectivo</span> \
								<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_pEfect" class="form-control" readonly value="'+pEfect+'" /> \
							</div> \
							<div class="input-group input-group-sm"> \
								<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">TDC Personal</span> \
								<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_pTpers" class="form-control" readonly value="'+pTDCpers+'" /> \
							</div> \
							<div class="input-group input-group-sm"> \
								<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">TDC Corporativa</span> \
								<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_pTcorp" class="form-control" readonly value="'+pTDCcorp+'" /> \
							</div> \
							<div class="input-group input-group-sm elementOculto"> \
								<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">TDC Corp OtroEmplead</span> \
								<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_pTcorpOE" class="form-control" readonly value="'+pTDCcorpOE+'" /> \
							</div> \
						</div> \
						<div class="col-sm-4"> \
							<div class="input-group input-group-sm elementOculto"> \
								<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">Deducible</span> \
								<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_ded" class="form-control" readonly value="'+ded+'" /> \
							</div> \
							<div class="input-group input-group-sm"> \
								<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">No Deducible</span> \
								<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_noded" class="form-control" readonly value="'+noDed+'" /> \
							</div> \
							<div class="input-group input-group-sm elementOculto"> \
								<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">IVA Acreditable</span> \
								<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_ivaAcre" class="form-control" readonly value="'+iva+'" /> \
							</div> \
							<div class="input-group input-group-sm"> \
								<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">IVA No Acreditable</span> \
								<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_ivaNoAcre" class="form-control" readonly value="'+noIva+'" /> \
							</div> \
						</div> ';
	}
	else
	{
			strHTML += '</div> ';
	}
		//Se concatena el String construido en las lineas anteriores y el definido en la función defineCarctrtcs()
		strHTML += definehtml +' \
					</div> \
		      	</div> \
		    </div> \
		</div>';
	//Se incrusta el String final contruido al DOM
	newElement.innerHTML = strHTML;
	//Los campos de tipo  catalogo como selectTpago, selectTgasto, selectOgastos, selectGautUti para este punto fueron declarados en el DOM, a continuación se determina su valor con base en lo proveniente de la KW que corresponda
	document.getElementById('tipo'+tipoGasto+'_fact'+countFact+'_tPago').selectedIndex = tipoPago; // Determina el catalogo selectTpago
	if(tipoGasto==14)
	{
		var num = 0;
		num = parseInt(detalleGasto);
		//alert(num);
		document.getElementById('tipo'+tipoGasto+'_fact'+countFact+'_tOgasto').selectedIndex = num; //Determina el catalogo selectOgastos solo para el tipo de gasto Otros Gastos (Id 14)
	}
	else if(tipoGasto==17)
	{
		if(detalleGasto=='') detalleGasto = '0-0';
		detalles = detalleGasto.split('-');
		document.getElementById('tipo'+tipoGasto+'_fact'+countFact+'_tAutUti').selectedIndex = detalles[0]; //Determina el catalogo selectGautUti solo para el tipo de gasto Autos utilitarios (Id 17), ademas que se obtiene de la separación del campo detalleGastos en la posición 0 del split por guion medio (-)
	}
}
/*=======================
Crea graficamente un registro por cada Concepto de CFDI (CCFDI) que haya sido separado del tipo de gasto de su CFDI orginal en el cuepor del Form
=======================
Función que se manda a llamar desde la función recorrerKWFact() por cada Comprobante de tipo CCFDI que contenga la comprobación en curso. Recibe todos los datos necesarios para crear el registro provenientes de los KWTG GV - Posiciones
 */
function creaConcptCFDI(tipoGasto, i, tipoFact, detalleGasto, SerieFolio, rfc, provee, uuid, tipoPago, fecha, subtotal, total, ded, noDed, iva, noIva, impLoc, serv, desgloce, handle, remanente)
{
	counts[tipoGasto]++; //Se incrementa en el array en Memoria que el tipo de Gasto contiene un comprobante mas de su tipo de gasto
	countFact = counts[tipoGasto]; //Obtiene el numero actual de Comprobantes que contiene el tipo de gastos (incluyendo la que esta en curso), este sera el ID de los elementos HTML que se construyan para este comprobante

	//Se llama función para determinar las caracteristicas particulares del tipo de gasto, por ejemplo en Hospedaje se requiere un campo "Cant Noches" el cual se obtiene a su vez del KW Pos_DetalleGasto que se incluye en el KWTG GV - Posiciones, por lo que esta función retornara un String con el contenido de codigo HTML de los campos y caracteristicas particulares de cada Tipo de gasto, incluyendo ya los valores correspondientes a cada campo. Este Str será concatenado mas adelante.
	var definehtml = defineCarctrtcs(tipoGasto, countFact, detalleGasto, tipoFact, impLoc, serv, VistaSimple);

	//Se crea el elmento HTML en el DOM de la pagina para crear el comprobante Factura CFDI dentro de su caja correspondiente facts_tipo[x] donde x es el ID del tipo de gasto
	var p = document.getElementById('facts_tipo' + tipoGasto);
    var newElement = document.createElement('div');
    newElement.setAttribute('id', 'div_tipo' + tipoGasto + 'No_' + countFact);
    p.appendChild(newElement);

    //console.log('tipoGasto=' + tipoGasto + ' counts=' + counts[tipoGasto]);

    //Se construye en un String el HTML para el concepto del CFDI, incluyendo los ID's de cada elemento y los valores que contendrá como UUID, RFC, Montos, etc.
	var strHTML = '<div class="panel panel-default"> \
		  	<!-- \
			Encabezado Panel Factura \
			--> \
		    <div class="panel-heading" style="background-color: #BCDBA4;"> \
		      <h4 class="panel-title"> \
		        <a data-toggle="collapse" data-parent="#body_tipo'+tipoGasto+'" href="#collapse_tipo'+tipoGasto+'_No'+countFact+'"> \
		        Concepto de CFDI ' + SerieFolio + '</a> \
		      </h4> \
		    </div> \
		    <!-- \
			Contenido Factura \
			--> \
		    <div id="collapse_tipo'+tipoGasto+'_No'+countFact+'" class="panel-collapse collapse"> \
		      <div class="panel-body"> \
		      <div class="elementOculto"> \
		      	<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_handle"  value="'+handle+'" /> \
				<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_seriefol"  value="'+SerieFolio+'" /> \
				<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_tipoFact" value="'+tipoFact+'" /> \
				<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_desgloce" value="'+desgloce+'" /> \
				<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_totFact" value="'+total+'" /> \
				<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_cantItems" value="" /> \
				<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_remamente" value="'+remanente+'" /> \
			  </div> \
				<div class="col-sm-4"> \
					<div class="input-group input-group-sm"> \
					<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">RFC</span> \
					<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_rfc" class="form-control" readonly value="'+rfc+'" /> \
					</div> \
				</div> \
				<div class="col-sm-4"> \
					<div class="input-group input-group-sm"> \
					<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">Serie/Folio</span> \
					<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_fol" class="form-control" readonly value="'+SerieFolio+'" /> \
					</div> \
				</div> \
				<div class="col-sm-4"> \
					<div class="input-group input-group-sm"> \
					<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">Fecha</span> \
					<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_fecha" class="form-control" readonly value="'+fecha+'" /> \
					</div> \
				</div> \
				<div class="col-sm-4"> \
					<div class="input-group input-group-sm"> \
					<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">UUID</span> \
					<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_uuid" class="form-control" readonly value="'+uuid+'" /> \
					</div> \
				</div> \
				<!-- \
				Contenido Factura Tabla de Detalle por concepto \
				--> \
		      	<table class="table" id="'+tipoGasto+'tabFact'+countFact+'"> \
			    <thead> \
			      <tr> \
			        <th class="col-md-4">Concepto</th> \
			        <th class="col-md-2">TipoGasto</th>\
			        <th class="col-md-1 aligRight">IVA</th> \
			        <th class="col-md-1 aligRight">Total</th> \
			      </tr> \
			     </thead> \
			     <tbody> \
			      <tr> \
			        <th class="col-md-4"> \
			        	<div class="input-group input-group-sm width100"> \
			        		<input class="form-control" type="text" readonly id="tipo'+tipoGasto+'_fact'+countFact+'_cpto" value="'+provee+'" /> \
			        	</div> \
			        </th> \
			        <th class="col-md-2"> \
			        	<select class="form-control" style="cursor: default;" disabled id="tipo'+tipoGasto+'_fact'+countFact+'_tGasto"> \
						'+selectTgasto+ '</select> \
			        </th>\
			        <th class="col-md-1 aligRight"> \
			        	<div class="input-group input-group-sm"> \
			        		<input class="form-control aligRight" type="text" readonly id="tipo'+tipoGasto+'_fact'+countFact+'_ivaFact" value="'+subtotal+'" /> \
			        	</div> \
			        </th> \
			        <th class="col-md-1 aligRight"> \
			        	<div class="input-group input-group-sm"> \
			        		<input class="form-control aligRight" type="text" readonly id="tipo'+tipoGasto+'_fact'+countFact+'_subtotFact" value="'+total+'" /> \
			        	</div> \
			        </th> \
			      </tr> \
			    </tbody> \
			  	</table> \
			  	<div class="row"> \
				  	<div class="col-sm-4"> \
						<div class="input-group input-group-sm"> \
						<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">TipoPago Principal</span> \
							<select class="form-control" disabled style="cursor: default;" id="tipo'+tipoGasto+'_fact'+countFact+'_tPago"> \
							'+selectTpago+ '</select> \
						</div> \
					</div>';
	if(VistaSimple == false) //Si la variable Global VistaSimple esta activa se omite la creación de los siguientes elementos, VistaSimple esta activa normalmente para la aprobación del Autorizador
		{
			strHTML += '<div class="col-sm-4"> \
							<div class="input-group input-group-sm"> \
								<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">Deducible</span> \
								<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_ded" class="form-control" readonly value="'+ded+'" /> \
							</div> \
							<div class="input-group input-group-sm"> \
								<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">No Deducible</span> \
								<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_noded" class="form-control" readonly value="'+noDed+'" /> \
							</div> \
							<div class="input-group input-group-sm"> \
								<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">IVA Acreditable</span> \
								<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_ivaAcre" class="form-control" readonly value="'+iva+'" /> \
							</div> \
							<div class="input-group input-group-sm"> \
								<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">IVA No Acreditable</span> \
								<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_ivaNoAcre" class="form-control" readonly value="'+noIva+'" /> \
							</div> \
						</div>';
		}			
			//Se concatena el String construido en las lineas anteriores y el definido en la función defineCarctrtcs()
			strHTML += ' ' + definehtml +'\
					</div> \
				  	\
			      </div> \
			    </div> \
			  </div>';
	//Se incrusta el String final contruido al DOM
	newElement.innerHTML = strHTML;
	//Los campos de tipo  catalogo como selectTpago, selectTgasto, selectOgastos, selectGautUti para este punto fueron declarados en el DOM, a continuación se determina su valor con base en lo proveniente de la KW que corresponda
	document.getElementById('tipo'+tipoGasto+'_fact'+countFact+'_tGasto').selectedIndex = tipoGasto;
	document.getElementById('tipo'+tipoGasto+'_fact'+countFact+'_tPago').selectedIndex = tipoPago; // Determina el catalogo selectTpago
	if(tipoGasto==14)
	{
		var num = 0;
		num = parseInt(detalleGasto);
		alert(num);
		document.getElementById('tipo'+tipoGasto+'_fact'+countFact+'_tOgasto').selectedIndex = num; //Determina el catalogo selectOgastos solo para el tipo de gasto Otros Gastos (Id 14)
	}
	else if(tipoGasto==17)
	{
		if(detalleGasto=='') detalleGasto = '0-0';
		detalles = detalleGasto.split('-');
		document.getElementById('tipo'+tipoGasto+'_fact'+countFact+'_tAutUti').selectedIndex = detalles[0]; //Determina el catalogo selectGautUti solo para el tipo de gasto Autos utilitarios (Id 17), ademas que se obtiene de la separación del campo detalleGastos en la posición 0 del split por guion medio (-)
	}
}
/*=======================
Crea graficamente mensaje de Alerta
=======================
Crea mensajes de Alerta proveniente de los siguientes elementos:
- Cuando la comprobación ya fue previamente procesada, las KW ReglaNoCumple a nivel general y a nivel KWTG GV - Posicion del DT GV - Comprobación podrian ya encontrarse llenas, por lo que las funciones CargaPagina() y recorrerKWFact() se encargaran de llamar a esta función creaAlerta(), indicando que se trata de Elementos Fijos, tipoAlert 3 o 4.
- Cuando el usuario Autorizador visualiza su comprobación previo a su aprobación se realizará la validación de Reglas de Negocio Nadro, las cuales pueden derivar en una alerta unicamente informativa desde la función validaReglas()
- Cuando el usuario de Contraloria se dispone a preparar la comprobación previo a su contabilización, y oprime el boton Valida Reglas la función validaReglas() se encargara de generar las alertas necesarias indicando que se trata de elementos Informativos o Restrictivos, tipoAlert 1 o 2.
 */
function creaAlerta(tipoGasto, tipoAlert, Msj)
{
	/*	
	tipoAlert
	0 = Warning Amarillo (con opcion a ignorar)
	1 = Danger Rojo (restrictivo)
	3 = Warning Amaricllo (Fijo)
	4 = Danger Rojo (Fijo)
	Se crea el elmento HTML en el DOM de la pagina para crear la alerta dentro de su caja correspondiente alert_tipo[x] donde x es el ID del tipo de gasto. Considerese la existencia de la caja con ID X = 0 que corresponde a la caja general del Formulario en la parte superior, aqui se deberan enviar Alertas generales*/
	var p = document.getElementById('alert_tipo'+tipoGasto);
    var newElement = document.createElement('div');
    p.appendChild(newElement);

	
	//Crea y envia al DOM el elemento junto al mensaje requerido
	if(tipoAlert == 0)
	{
		newElement.innerHTML = '<div class="alert alert-warning alert-dismissible" role="alert"> \
								<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button> \
								<input class="transparent width90" type="text" name="NombreKeywordOB" readOnly value="'+Msj+'" /> \
							</div>';
	}
	else if(tipoAlert == 1)
	{
		newElement.innerHTML = '<div class="alert alert-danger"> \
									<input class="transparent width100" type="text" name="NombreKeywordOB" readOnly value="'+Msj+'" /> \
							</div>';
		errors[tipoGasto]++;
	}
	else if(tipoAlert == 2)
	{
		newElement.innerHTML = '<div class="alert alert-warning"> \
									<input class="transparent width100" type="text" name="NombreKeywordOB" readOnly value="'+Msj+'" /> \
							</div>';
	}
	else if(tipoAlert == 3)
	{
		newElement.innerHTML = '<div class="alert alert-danger"> \
									<input class="transparent width100" type="text" name="NombreKeywordOB" readOnly value="'+Msj+'" /> \
							</div>';
	}
}
/*=======================
Función valida cada comprobante vs los Topes Nadro del AFKS Pol - Topes
=======================
Recorrera todos los comprobantes de cierto Tipo de Gasto, el cual recibe como parametro de entrada, previa validación que cada tipo de gasto contenga al menos un comprobante utilizando el array de la variable global exists[]
- Es llamado desde la función cargaPagina() cuando la KW Estatus WF es "COMPROBACION ESPERA APROBACION" con la propiedad de no escribir en KW el resultado de esta validación con la variable global escribirKW
- Tambien es llamado desde la función validacionForm() bajo demanda del usuario de Contraloria con el boton "Valida Reglas y Suma Montos" en este casi la propiedad global escribirKW es True
 */
function validaReglas(tipoGasto)
{
	countFact = counts[tipoGasto]; //Obtiene Cantidad de comprobantes que se tienen por tipo de gasto
	errors[tipoGasto] = 0; //Establece la cantidad de errores en el array la variable global en cero
	var tipoG = parseInt(tipoGasto, 10); //Convierte tipo de gasto a tipo de dato entero
	var destinoViajeOr = document.getElementById('OBKey__590_1').value; //Obtiene la KW CatDetstino general en el DT, proveniente desde la captura inicial del usuario en el portal
	var nivelSolicitante = document.getElementById('OBKey__591_1').value; //Obtiene la KW NivelSolicitante general en el DT, proveniente de la consulta a Human y el AFKS GV - Cat Puestos/Niveles gestionado en WF
	var kmsGasolinaAnio = document.getElementById('OBKey__654_1').value; //Obtiene la KW Pol_TopeGasAño general en el DT, proveniente del AFKS GV - ControlAnual Kms Gasolina el cual contiene una actualización por empleado de la cantidad de Kms comprobados a lo largo del Año
	//Declara variables con ambito de la función para el control de datos mas adelante. 
	var destinoViaje;
	var destinoCiudad;
	var pol_destino;
	var pol_nivel;
	var pol_TopeFiscNac;
	var pol_tFiscNac = false;
	var pol_TopeFiscExt;
	var pol_tFiscExt = false;
	var pol_NotasTopeFisc;
	var pol_unidadFis = 0;
	var pol_valUFis;
	var pol_TopeNadro;
	var pol_rest;
	var restric;
	var pol_tNadro = false;
	var pol_NotasTopeNadro;
	var pol_unidadNadro;
	var pol_valUNadro = 0;
	var idReg = 0;
	var Msj ='';
	var encontrado = false;
	var topeKmsGasolina;
	
	if(nivelSolicitante == "A")
	{
		return;
	}

	if(destinoViajeOr == 'NACIONAL_CDMX') //Evalua si el destino del viaje es CDMX
	{
		destinoViaje = 'CDMX';
		destinoCiudad = 'CDMX';
	}
	else if(destinoViajeOr == 'EXTRANJERO') //Evalua si el destino del viaje es al EXTRANJERO
	{
		destinoViaje = 'EXTRANJERO';
	}
	else //Caso contrario a CDMX y EXTRANJERO se determina como nacional
	{
		destinoViaje = 'NACIONAL';
		var arrDestinoViajeOr = destinoViajeOr.split('_'); //Se separa el valor del campo Destino por guion bajo
		destinoCiudad = arrDestinoViajeOr[1];
	}

	for(var h=1; h<=10; h++) //Se recorre las KW del KWTG Pol - Campos 
	{
		var tipoCampo = document.getElementById('OBKey__472_'+h).value;
		if(tipoCampo == 'LIMIT_KMSGASOLINA') //Busca el valor del limite Anual de Gasolina
		{
			topeKmsGasolina = document.getElementById('OBKey__471_'+h).value;
			break;
		}
	}

	for(var n = 1; n<= 25; n++) //Recorre KW de KWTG Pol - Topes
	{
		var reg = document.getElementById('OBKey__385_'+n).value;
		if(reg==tipoGasto) //Evalua si el ID del Tipo de Gastos del registro en curso corresponde al que se esta trabajando en la función
		{
			//En caso de que si corresponda, se obtiene el destino y el nivel del KWTG Pol - Topes
			pol_destino = document.getElementById('OBKey__469_'+n).value;
			pol_nivel = document.getElementById('OBKey__470_'+n).value;
			//alert('n '+ n + ' reg '+ reg + ' pol_destino ' + pol_destino + ' pol_nivel ' + pol_nivel + ' destinoViaje ' + destinoViaje + ' nivelSolicitante ' + nivelSolicitante);
			if(pol_destino != '') //Evaluamos si para el tipo de gasto aplica control de destino, es decir no este vacio
			{
				if(pol_destino == destinoViaje) //Evaluamos si el destino encontrado en el KWTG Pol - Topes corresponde al destino de la comprobación en curso
				{
					pol_rest = document.getElementById('OBKey__510_'+n).value; //Obtiene del KWTG Pol - Topes el campo con el nivel de control de la regla KW Pol_Restrictivo
					encontrado = true; //Establece en variable de entorno de la función que se encontró el registro con los topes para el tipo de gasto
				}
			}
			else if(pol_nivel != '') //Evalua si el nivel de empleado encontrado en el KWTG Pol Topes aplica como control, es decir no esta vacio
			{
				if(pol_nivel == nivelSolicitante) //Evaluamos si el nivel de empleado encontrado en el KWTG Pol - Topes corresponde al nivel del empleado de la comprobación en curso
				{
					pol_rest = document.getElementById('OBKey__510_'+n).value;
					encontrado = true; //Establece en variable de entorno de la función que se encontró el registro con los topes para el tipo de gasto
				}
			}
			else //Caso contrario obviamos que no aplica ningun control de Destino o Nivel de empleado para la regla de negocio
			{
				pol_rest = document.getElementById('OBKey__510_'+n).value; 
				encontrado = true; //Establece en variable de entorno de la función que se encontró el registro con los topes para el tipo de gasto
			}
			if(encontrado) //Evaliamos nuestra variable encontrado que se definio en las lineas anteriores como true o como false desde un inicio si no cambio
			{
				if(destinoViaje=='EXTRANJERO') //Evaliamos si el destino del viaje es al Extranjero
				{
					pol_TopeFiscExt = document.getElementById('OBKey__512_'+n).value; //Obtenemos el vlaor del Tope Fiscal para Extranjero del KWTG Pol - Topes
					if(pol_TopeFiscExt != '') //Si el campo no esta vacio se establece la variable de control tFiscExt como true, lo que indica que si habrá una validación de este tipo para los comprobantes de es tipo de gasto
					{
						pol_tFiscExt = true;
					}
				}
				else
				{
					pol_TopeFiscNac = document.getElementById('OBKey__513_'+n).value; //Obtenemos el vlaor del Tope Fiscal para Nacional del KWTG Pol - Topes
					if(pol_TopeFiscNac != '') //Si el campo no esta vacio se establece la variable de control tFiscNac como true, lo que indica que si habrá una validación de este tipo para los comprobantes de es tipo de gasto
					{
						pol_tFiscNac = true;
					}
				}
				pol_NotasTopeFisc = document.getElementById('OBKey__464_'+n).value; //Obtenemos el vlaor de las notas de Tope Fiscal del KWTG Pol - Topes
				if(pol_NotasTopeFisc != '') //Si estas no estan vacias
				{
					var uf = pol_NotasTopeFisc.split("-"); //Separamos las notas por guion medio, en la admnistración del KWTG Pol - Topes las Notas del Tope Fiscal deberan iniciar siempre con la unidad que será evaluada por ejemplo PESOS o UMAS seguidos de un guión medio con el resto de la descripción de la regla de negocio que aplica
					pol_unidadFis = uf[0]; //Tomamos el valor antes del guión medio como unidad de la regla de Tope Fiscal
				}
				pol_TopeNadro = document.getElementById('OBKey__514_'+n).value; //Obtenemos el valor del Tope Nadro del AFKS Pol - Topes
				if(pol_TopeNadro != '') //Si es campo no esta vacio
				{
					pol_tNadro = true; //Establece en variable de entorno de la función que se encontró el registro con los topes Nadro para el tipo de gasto
				}
				pol_NotasTopeNadro = document.getElementById('OBKey__466_'+n).value; //Obtenemos el vlaor de las notas de Tope Nadro del KWTG Pol - Topes
				if(pol_NotasTopeNadro != '') //Si estas no estan vacias
				{
					var un = pol_NotasTopeNadro.split("-"); //Separamos las notas por guion medio, en la admnistración del KWTG Pol - Topes las Notas del Tope Nadro deberan iniciar siempre con la unidad que será evaluada por ejemplo PESOS o UMAS seguidos de un guión medio con el resto de la descripción de la regla de negocio que aplica
					pol_unidadNadro = un[0]; //Tomamos el valor antes del guión medio como unidad de la regla de Tope Nadro
				}
				idReg = n;
				//alert('TopeFiscNac ' + pol_TopeFiscNac);
				//alert('TopeFiscExt ' + pol_TopeFiscExt);
				//alert('NotasTopeFisc ' + pol_NotasTopeFisc);
				//alert('TopeNadro ' + pol_TopeNadro); 
				//alert('NotasTopeNadro ' + pol_NotasTopeNadro);
				//alert('Restrictivo ' + pol_rest);
				//alert('idReg ' + idReg);
				break;
			}
		}
	}
	var arrpol_rest = pol_rest.split('-'); //Separamos por guion medio el valor del campo restrictivo

	//La validación por cada Comprobante de cada tipo de gasto se realiza a continuación, se tiene en un SwitchCase y con codigo repetido debido a que en el usuario dijo en todo momento que cada tipo de gasto tiene distintas validaciones y requeria distintos textos de salida, por lo que se determinó que cada tipo de gasto fuera un case distinto
	switch(tipoG)
	{
		//Aplica validaciones para el tipo de gasto 0, el cual corresponde al monto global de toda la comprobación de gastos de viaje y con base en el nivel de empleado
		case 0:
			if(pol_unidadNadro!='PESOS')//Evalua si la unidad con la que serealizarán los calculos el distinto a PESOS
			{
				pol_valUNadro = pol_TopeNadro * (ObtieneValorCampo(pol_unidadNadro)); //Llama función para obtener el valor de la UNIDAD del KWTG Pol - Campos, comunmente UMAS
			}
			var totalComprobacion = sumTotComp; 
			if(totalComprobacion > pol_valUNadro) //Evalua si el monto total de la comprobación es mayor al Tope Nadro correspondiente
			{
				var Msj = 'TOPE NADRO EXCEDE MAS DE ' + dosDecim(pol_TopeNadro) + ' ' + pol_NotasTopeNadro; //Crea Texto del mensaje a mostrar al usuario
				//alert(arrpol_rest[1]);
				restric = arrpol_rest[1].substring(1,2); //Obtiene el nivel de control o "restrictividad" del Tope Nadro para el tipo de gasto. Considerese que N0 es no restrictivo y N1 si es restrictivo
				creaAlerta('0', restric, Msj); //Llama función para crear la alerta visualmente en el DOM del Formulario, pasando fijo la posición 0 (que corresponde a nivel encabezado del Form)
				if(escribirKW == true) //Evalua por control si la variable global escribir es igual a True, recordemos que esta variable nos indicará si los Textos formados en la variable Msj serán escritos en las KW ReglaNoCumple en este caso general sobre el DT. Esta variable fue seteada en True desde la función validacionForm() que es la que llama a esta función, pero por control de valida nuevamente
				{
					if(restric==0) restric = 2; //Si la "restrictividad" de la regla es 0, es decir no es restrictiva, se establece en 2 para su posterior uso cuando el formulario sea cargado y cree las alertas en el DOM
					if(restric==1) restric = 3; //Si la "restrictividad" de la regla es 1, es decir no es restrictiva, se establece en 3 para su posterior uso cuando el formulario sea cargado y cree las alertas en el DOM
					var ValKW = restric + '|' + Msj; //Concatenamos el nuevo nivel de "alertamiento" con un pipe, para que pueda ser interpretado en el futuro
					for(var t=1; t<=3; t++) //Recorremos hasta un máximo de 3 veces la KW ReglaNoCumple pos si ya existe un mensaje previo
					{
						var tmp = document.getElementById('OBKey__622_' + t).value;
						if(tmp=='') //Si el valor del KW esta vacio, entonces escribimos en esa posición de la instancia del KW el mensaje formado
						{
							document.getElementById('OBKey__622_' + t).value = ValKW;
							break;
						}
					}
				}
			}
		break;
		//Validaciones para tipo de gasto 1 correspondiente a Hospedaje
		case 1:
			for(var i = 1; i<= countFact; i++) //Recorre facturas de tipo de gasto 1
			{
				Msj = '';
				//Obtiene  datos del comprobante conmo montos subtotales, handle, tipo, folio y cant de noches a partir de los campos creados en el cuerpo del fomulario. No de KW
				var handle = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_handle').value;
				var tipoFact = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_tipoFact').value;
				var folfact = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_seriefol').value;
				var monto = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_subtotFact').value);
				var noches = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_noches').value);
				var xdia = monto / noches; //Divide el monto en la cantidad de noches, para obtener el gasto por dia
				
				//alert('xdia ' + xdia + ' monto ' + monto);
				if(pol_tNadro) //Evalua si aplica politica Nadro para el tipo de gasto
				{
					if(pol_unidadNadro!='PESOS') //Evalua si la unidad de trabajo es distinta a PESOS
					{
						pol_valUNadro = pol_TopeNadro * (ObtieneValorCampo(pol_unidadNadro)); //Ejecuta función para obtener valor real de la unidad usada, por ej UMAS
						if(xdia>pol_valUNadro) //Evalua si el gasto por dia es mayor al tope Nadro
						{
							Msj = tipoFact + ' ' +folfact + ', TOPE NADRO EXCEDE MAS DE ' + dosDecim(pol_valUNadro) + ' ' + pol_NotasTopeNadro; //Construye Mensaje al usuario
						}
					}
					else
					{
						if(xdia>pol_TopeNadro) //Evalua si el gasto por dia es mayor al tope Nadro
						{
							Msj = tipoFact + ' ' +folfact + ', TOPE NADRO EXCEDE MAS DE ' + dosDecim(pol_TopeNadro) + ' ' + pol_NotasTopeNadro; //Construye Mensaje al usuario
						}
					}
					restric = arrpol_rest[1].substring(1,2); //Obtiene el nivel de "restrictividad" de la politca
				}
				if(Msj!='') //Confirma que el mensaje no esta vacio
				{
					creaAlerta(tipoGasto, restric, Msj); //Llama función para crear la alerta visualmente en la caja del DOM del Formulario que correspona al tipo de gasto
					if(escribirKW == true) //Evalua por control si la variable global escribir es igual a True, recordemos que esta variable nos indicará si los Textos formados en la variable Msj serán escritos en las KW ReglaNoCumple en este caso general sobre el DT. Esta variable fue seteada en True desde la función validacionForm() que es la que llama a esta función, pero por control de valida nuevamente
					{
						if(restric==0) restric = 2; //Si la "restrictividad" de la regla es 0, es decir no es restrictiva, se establece en 2 para su posterior uso cuando el formulario sea cargado y cree las alertas en el DOM
						if(restric==1) restric = 3; //Si la "restrictividad" de la regla es 1, es decir no es restrictiva, se establece en 3 para su posterior uso cuando el formulario sea cargado y cree las alertas en el DOM
						var ValKW = restric + '|' + Msj; //Concatenamos el nuevo nivel de "alertamiento" con un pipe, para que pueda ser interpretado en el futuro
						actualizaKW('posicion', tipoGasto, handle, 'RegNoC', ValKW); //Llama función para actualizar el valor de la KW ReglaNoCumple en KWTG GV - Posicion 
					}
				}
			}
		break;
		//Validaciones para tipo de gasto 2 correspondiente a Alimentos
		case 2:
			for(var i = 1; i<= countFact; i++) //Recorre facturas de tipo de gasto 2
			{
				Msj = '';
				//Obtiene  datos del comprobante conmo montos subtotales, handle, tipo, folio y cant de comidas y personas a partir de los campos creados en el cuerpo del fomulario. No de KW
				var handle = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_handle').value;
				var tipoFact = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_tipoFact').value;
				var folfact = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_seriefol').value;
				var monto = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_subtotFact').value);
				var personas = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_personas').value);
				var comidas = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_comidas').value);
				var xdia = (monto / comidas) / personas; //Divide el monto entre la cantidad de comidas y el resultado a su vez entre la cantidad de personas para obtener el gasto por consumo

				//alert('iterador ' + i + ' monto dia = ' + xdia + ' de (monto ' + monto + ' / comidas ' + comidas + ') / personas ' + personas);
				if(pol_tNadro) //Evalua si aplica politica Nadro para el tipo de gasto
				{
					if(pol_unidadNadro!='PESOS') //Evalua si la unidad de trabajo es distinta a PESOS
					{
						pol_valUNadro = pol_TopeNadro * (ObtieneValorCampo(pol_unidadNadro)); //Ejecuta función para obtener valor real de la unidad usada, por ej UMAS
						if(xdia>pol_valUNadro) //Evalua si el gasto por consumo es mayor al tope Nadro
						{
							Msj = tipoFact + ' ' +folfact + ', TOPE NADRO EXCEDE MAS DE ' + dosDecim(pol_TopeNadro) + ' ' + pol_NotasTopeNadro; //Construye Mensaje al usuario
						}
					}
					else
					{
						if(xdia>pol_TopeNadro) //Evalua si el gasto por consumo es mayor al tope Nadro
						{
							Msj = tipoFact + ' ' +folfact + ', TOPE NADRO EXCEDE MAS DE ' + dosDecim(pol_TopeNadro) + ' ' + pol_NotasTopeNadro; //Construye Mensaje al usuario
						}
					}
					restric = arrpol_rest[1].substring(1,2); //Obtiene el nivel de "restrictividad" de la politca
				}
				if(Msj!='') //Confirma que el mensaje no esta vacio
				{
					//alert(Msj);
					creaAlerta(tipoGasto, restric, Msj); //Llama función para crear la alerta visualmente en la caja del DOM del Formulario que correspona al tipo de gasto
					if(escribirKW == true) //Evalua por control si la variable global escribir es igual a True, recordemos que esta variable nos indicará si los Textos formados en la variable Msj serán escritos en las KW ReglaNoCumple en este caso general sobre el DT. Esta variable fue seteada en True desde la función validacionForm() que es la que llama a esta función, pero por control de valida nuevamente
					{
						if(restric==0) restric = 2; //Si la "restrictividad" de la regla es 0, es decir no es restrictiva, se establece en 2 para su posterior uso cuando el formulario sea cargado y cree las alertas en el DOM
						if(restric==1) restric = 3; //Si la "restrictividad" de la regla es 1, es decir no es restrictiva, se establece en 3 para su posterior uso cuando el formulario sea cargado y cree las alertas en el DOM
						var ValKW = restric + '|' + Msj; //Concatenamos el nuevo nivel de "alertamiento" con un pipe, para que pueda ser interpretado en el futuro
						//alert(ValKW);
						actualizaKW('posicion', tipoGasto, handle, 'RegNoC', ValKW); //Llama función para actualizar el valor de la KW ReglaNoCumple en KWTG GV - Posicion 
					}
				}
			}
		break;
		//Validaciones para tipo de gasto 4 correspondiente a Boletos de Avión
		case 4:
			for(var i = 1; i<= countFact; i++) //Recorre facturas de tipo de gasto 4
			{
				Msj = '';
				//Obtiene  datos del comprobante conmo montos subtotales, handle, tipo, folio y kms recorridos a partir de los campos creados en el cuerpo del fomulario. No de KW
				var handle = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_handle').value;
				var tipoFact = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_tipoFact').value;
				var folfact = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_seriefol').value;
				var monto = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_subtotFact').value);
				var kms = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_kms').value);
				
				//alert('iterador ' + i + ' monto dia = ' + xdia + ' de (monto ' + monto + ' / comidas ' + comidas + ') / personas ' + personas);
				if(pol_tNadro) //Evalua si aplica politica Nadro para el tipo de gasto
				{
					var arrListEstados = Array();
					var arrNiv = Array();
					var pasa=false;

					if(pol_unidadNadro='KM') //Evalua si la unidad de trabajo es Kilometros
					{
						var arrDivTxt = pol_NotasTopeNadro.split('EXCLUYENDO:'); //Separa el texto de las Notas del Tope Nadro con la palabra "EXCLUYENDO"
						var strListEstados = arrDivTxt[1]; 
						arrListEstados = strListEstados.split(','); //Toma la parte de la derecha del split anterior y ahora separa por coma "," asignando el resultado del split en el array de la variable previamente declarada arrListEstados
						for(var q=0; q<=arrListEstados.length-1; q++) //Recorre la lista de estados creada arriba
						{
							var niv = arrListEstados[q].search(/NIVEL/i); //Valida si el valor en curso incluye la palabra "NIVEL"
							if(niv>=1) 
							{
								arrNiv = arrListEstados[q].split(' '); //En Caso de que si incluya la palabra "NIVEL" ahora hace un split por espacio " "
								if(arrNiv[2]==nivelSolicitante) //Evalua si el nivel que corresponde a una letra en el campo Notas con el texto ",NIVEL A" es igual al nivel de empleado de la comprobación
								{
									pasa=true; //Establece la variable pasa como true, ya que cumplio con el nivel de empleado excluido
									break;
								}
							}
							else //En caso de que no contenga el texto "NIVEL"
							{
								if(destinoCiudad==trim(arrListEstados[q])) //Evalua si el destino de la comprobación es igual al destino de la lista de exluidos
								{
									pasa=true; //Establece la variable pasa como true, ya que cumplio con el destino de la lista de excluidos de la regla
									break;
								}
							}
						}
						if(pasa==false) //Si la variable pasa sigue siendo false despues de las anteriores validaciones
						{
							if(parseInt(kms) > parseInt(pol_TopeNadro)) //Evalua si la cantidad de Kms ingresada por el usuario es mayor al Tope Nadro
							{
								pasa=false;  //Establece la variable pasa como false, ya que no cumplio con la regla
							}
							else
							{
								pasa=true; //Establece la variable pasa como true, ya que si cumplio con la regla
							}
						}
						if(pasa==false) //Si la variable pasa sigue siendo false despues de las aneriores validaciones
						{
							Msj = tipoFact + ' ' +folfact + ', TOPE NADRO VIAJE MENOR A ' + dosDecim(pol_TopeNadro) + ' ' + pol_NotasTopeNadro; //Construye Mensaje al usuario
						}
					}
					restric = arrpol_rest[1].substring(1,2); //Obtiene el nivel de "restrictividad" de la politca
				}
				if(Msj!='') //Confirma que el mensaje no esta vacio
				{
					creaAlerta(tipoGasto, restric, Msj); //Llama función para crear la alerta visualmente en la caja del DOM del Formulario que correspona al tipo de gasto
					if(escribirKW == true) //Evalua por control si la variable global escribir es igual a True, recordemos que esta variable nos indicará si los Textos formados en la variable Msj serán escritos en las KW ReglaNoCumple en este caso general sobre el DT. Esta variable fue seteada en True desde la función validacionForm() que es la que llama a esta función, pero por control de valida nuevamente
					{
						if(restric==0) restric = 2; //Si la "restrictividad" de la regla es 0, es decir no es restrictiva, se establece en 2 para su posterior uso cuando el formulario sea cargado y cree las alertas en el DOM
						if(restric==1) restric = 3; //Si la "restrictividad" de la regla es 1, es decir no es restrictiva, se establece en 3 para su posterior uso cuando el formulario sea cargado y cree las alertas en el DOM
						var ValKW = restric + '|' + Msj; //Concatenamos el nuevo nivel de "alertamiento" con un pipe, para que pueda ser interpretado en el futuro
						//alert(ValKW);
						actualizaKW('posicion', tipoGasto, handle, 'RegNoC', ValKW); //Llama función para actualizar el valor de la KW ReglaNoCumple en KWTG GV - Posicion
					}
				}
			}
		break;
		case 5: //No aplican reglas
		break;
		case 6: //No aplican reglas
		break;
		case 7: //No aplican reglas
		break;
		//Validaciones para tipo de gasto 8 correspondiente a Gasolinas
		case 8:
			var sumakms = 0; //Declara variable para ir
			for(var i = 1; i<= countFact; i++) //Recorre facturas de tipo de gasto 1
			{
				Msj = '';
				//Obtiene  datos del comprobante conmo montos subtotales, handle, tipo, folio, litros y kms consumidos a partir de los campos creados en el cuerpo del fomulario. No de KW
				var handle = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_handle').value;
				var tipoFact = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_tipoFact').value;
				var folfact = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_seriefol').value;
				var monto = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_subtotFact').value);
				var litros = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_litros').value);
				var kms = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_kms').value);
				sumakms += kms; //Suma los Kms del comprobante actual a la variable general de gasolinas
				var xkm = monto / kms; //Divide el monto entre los kms recorridos para obtener el costo por km
				
				//alert('xkm'+xkm);
				//alert('iterador ' + i + ' monto dia = ' + xkm + ' de (monto ' + monto + ' / kms ' + kms + ') / litros ' + litros);
				if(pol_tNadro) //Evalua si aplica politica Nadro para el tipo de gasto
				{
					if(pol_unidadNadro!='PESOS') //Evalua si la unidad de trabajo es distinta a PESOS
					{
						pol_valUNadro = pol_TopeNadro * (ObtieneValorCampo(pol_unidadNadro)); //Ejecuta función para obtener valor real de la unidad usada, por ej UMAS
						if(xkm>pol_valUNadro) //Evalua si el costo por km es mayor al tope Nadro
						{
							Msj = tipoFact + ' ' +folfact + ', TOPE NADRO EXCEDE MAS DE ' + dosDecim(pol_valUNadro) + ' ' + pol_NotasTopeNadro; //Construye Mensaje al usuario
						}
					}
					else
					{
						if(xkm>pol_TopeNadro) //Evalua si el costo por km es mayor al tope Nadro
						{
							Msj = tipoFact + ' ' +folfact + ', TOPE NADRO EXCEDE MAS DE ' + dosDecim(pol_TopeNadro) + ' ' + pol_NotasTopeNadro; //Construye Mensaje al usuario
						}
					}
					restric = arrpol_rest[1].substring(1,2); //Obtiene el nivel de "restrictividad" de la politca
				}
				if(Msj!='') //Confirma que el mensaje no esta vacio
				{
					creaAlerta(tipoGasto, restric, Msj); //Llama función para crear la alerta visualmente en la caja del DOM del Formulario que correspona al tipo de gasto
					if(escribirKW == true) //Evalua por control si la variable global escribir es igual a True, recordemos que esta variable nos indicará si los Textos formados en la variable Msj serán escritos en las KW ReglaNoCumple en este caso general sobre el DT. Esta variable fue seteada en True desde la función validacionForm() que es la que llama a esta función, pero por control de valida nuevamente
					{
						if(restric==0) restric = 2; //Si la "restrictividad" de la regla es 0, es decir no es restrictiva, se establece en 2 para su posterior uso cuando el formulario sea cargado y cree las alertas en el DOM
						if(restric==1) restric = 3; //Si la "restrictividad" de la regla es 1, es decir no es restrictiva, se establece en 3 para su posterior uso cuando el formulario sea cargado y cree las alertas en el DOM
						var ValKW = restric + '|' + Msj; //Concatenamos el nuevo nivel de "alertamiento" con un pipe, para que pueda ser interpretado en el futuro
						//alert(ValKW);
						actualizaKW('posicion', tipoGasto, handle, 'RegNoC', ValKW); //Llama función para actualizar el valor de la KW ReglaNoCumple en KWTG GV - Posicion 
					}
				}
			}
			/*//alert('kmsGasolinaAnio:'+kmsGasolinaAnio+' sumakms:'+sumakms+' topeKmsGasolina:'+topeKmsGasolina);
			if((kmsGasolinaAnio+sumakms)>topeKmsGasolina) //Al final de recorrer todos los comprobantes del tipo de gasto 8 (gasolina), se valida la suma de los kms de esta comprobación más los kms acumulados en el Año (provenientes del AFKS GV - ControlAnual Kms Gasolina) es mayor al Tope de Gasolina (proveniente del AFKS GV - Cat Campos Diversos)
			{
				Msj = 'EL EMPLEADO LLEGO AL LIMITE DE '+ dosDecim(topeKmsGasolina) +' DEDUCIDOS EN EL EJERCICIO FISCAL' //Se construye mensaje al usuario
				creaAlerta(tipoGasto, 1, Msj); //Llama función para crear la alerta visualmente en la caja del DOM del Formulario que correspona al tipo de gasto
				var ValKW = '3|' + Msj; //Concatenamos el nuevo nivel de "alertamiento" con un pipe, para que pueda ser interpretado en el futuro
				if(escribirKW == true) //Evalua por control si la variable global escribir es igual a True, recordemos que esta variable nos indicará si los Textos formados en la variable Msj serán escritos en las KW ReglaNoCumple en este caso general sobre el DT. Esta variable fue seteada en True desde la función validacionForm() que es la que llama a esta función, pero por control de valida nuevamente
				{
					for(var t=1; t<=3; t++) //Recorremos hasta un máximo de 3 veces la KW ReglaNoCumple pos si ya existe un mensaje previo
					{
						var tmp = document.getElementById('OBKey__622_' + t).value;
						if(tmp=='') //Si el valor del KW esta vacio, entonces escribimos en esa posición de la instancia del KW el mensaje formado
						{
							document.getElementById('OBKey__622_' + t).value = ValKW;
							break;
						}
					}
				}
			}*/
		break;
		case 9: //No aplican reglas
		break;
		//Validaciones para tipo de gasto 10 correspondiente a Renta de Auto
		case 10:
			for(var i = 1; i<= countFact; i++)
			{
				Msj = '';
				//Obtiene montos subtotales y noches por factura y los divide para obtener el gasto por noche
				var handle = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_handle').value;
				var tipoFact = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_tipoFact').value;
				var folfact = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_seriefol').value;

				var monto = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_subtotFact').value);
				var dias = parseInt(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_dias').value);
				var xdia = monto / dias;
				//alert('iterador ' + i + ' monto dia = ' + xdia + ' de (monto ' + monto + ' / comidas ' + comidas + ') / personas ' + personas);
				
				if(pol_tNadro)
				{
					if(pol_unidadNadro!='PESOS')
					{
						pol_valUNadro = pol_TopeNadro * (ObtieneValorCampo(pol_unidadNadro));
						if(xdia>pol_valUNadro)
						{
							Msj = tipoFact + ' ' +folfact + ', TOPE NADRO EXCEDE MAS DE ' + dosDecim(pol_valUNadro) + ' ' + pol_NotasTopeNadro;
						}
					}
					else
					{
						if(xdia>pol_TopeNadro)
						{
							Msj = tipoFact + ' ' +folfact + ', TOPE NADRO EXCEDE MAS DE ' + dosDecim(pol_TopeNadro) + ' ' + pol_NotasTopeNadro;
						}
					}
					restric = arrpol_rest[1].substring(1,2);
				}
				if(Msj!='')
				{
					creaAlerta(tipoGasto, restric, Msj);
					if(escribirKW == true)
					{
						if(restric==0) restric = 2;
						if(restric==1) restric = 3;
						var ValKW = restric + '|' + Msj;
						//alert(ValKW);
						actualizaKW('posicion', tipoGasto, handle, 'RegNoC', ValKW);
					}
				}
			}
		break;
		case 11: //No aplican reglas
		break;
		case 12: //No aplican reglas
		break;
		case 13: //No aplican reglas
		break;
		case 14: //No aplican reglas
		break;
		case 15: //No aplican reglas
		break;
		case 16: //No aplican reglas
		break;
		case 17: //No aplican reglas
		break;
		default:
		break;
	}
}
/*=======================
Función para cargar el valor de un campo vario
=======================
Función recorre un máximo 15 veces las KW del KWTG Pol - Campos, buscando el elemento solicitado.
Principalmente requerido para obtener el valor de UMA o Tope Fiscal de Pago en Efectivo desde la funcion sumaMontos()
 */
function ObtieneValorCampo(tipo)
{
	for(var n = 1; n<= 15; n++)
	{
		var campo = document.getElementById('OBKey__472_'+n).value; 
		if(campo==tipo)
		{
			var valor = document.getElementById('OBKey__471_'+n).value; 
			return valor;
			break;
		}
	}
}
/*=======================
Función crear los elementos particulares de cad tipo de gasto
=======================
Mientras se construye cada registro de Comprobante ya sea CFDI, CCFDI, IMG o SCOMP, con las funciones creaFactCFDI(), creaConcptCFDI(), creaFactIMG()  respectivamente, llama esta función enviando el ID del Tipo de Gasto, el detalle del tipo de gasto, entre otros datos para determinar los campos y caracteristicas de cada tipo de gasto. Por ejemplo en Hospedaje se crean los campos: Cant Noches, impuesto local (ISH) y propina.

La función retorna un String con el codigo HTML que formará parte de la construcción de los elementos del comprobante a ser enviados al DOM del HTML.
 */
function defineCarctrtcs(tipoGasto, countFact, detalleGasto, tipoFact, impLoc, serv, VistaSimple)
{
	var tipoG = parseInt(tipoGasto, 10);
	var html;
	var elementOculto = '';
	if(VistaSimple) //Si la variable global VistaSimple es igual a True, algunos campos son declarados con la Clase CSS ElementoOculto para no ser desplegados al usuario, pero existentes por si alguna función requiere acceder a la data establecida en dichos campos.
	{
		elementOculto = 'elementOculto';
	}
	//alert(tipoGasto +" - " + VistaSimple);
	//Con base en el ID del tipo de Gasto creamos sus elementos o se regresa el Str Vacio en caso de no requerir ningun campo particular.
	switch(tipoG)
	{
		case 1:
			if(detalleGasto=='') detalleGasto = '1'; //Si el detalle del gasto proveniente del portal esta vacio, que en Hospedaje corresponde a cantidad de noches. Se establece en 1
			html = '<div class="col-sm-4"> \
						<div class="input-group input-group-sm"> \
							<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">Servicio</span> \
							<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_servicio" readonly class="form-control" value="'+serv+'" /> \
						</div> \
						<div class="input-group input-group-sm '+elementOculto+'"> \
							<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">ISH</span> \
							<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_ish" readonly class="form-control" value="'+impLoc+'" /> \
						</div> \
						<div class="input-group input-group-sm '+elementOculto+'"> \
							<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">Noches</span> \
							<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_noches" readonly class="form-control" value="'+detalleGasto+'" /> \
						</div> \
					</div> ';
		break;
		case 2:
			if(detalleGasto=='') detalleGasto = '1-1'; //Si el detalle del gasto proveniente del portal esta vacio, que en Alimentos corresponde a cantidad de comidas, guion medio y la cantidad de personas. Se establece en 1-1
			detalles = detalleGasto.split('-'); //Separamos el Str del Detalle por el guion medio para poder ser utilizado en dos campos diferentes
			html = '<div class="col-sm-4"> \
						<div class="input-group input-group-sm"> \
							<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">Servicio</span> \
							<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_servicio" readonly class="form-control" value="'+serv+'" /> \
						</div> \
						<div class="input-group input-group-sm '+elementOculto+'"> \
							<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">Cant Comidas</span> \
							<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_comidas" readonly class="form-control" value="'+detalles[0]+'" /> \
						</div> \
						<div class="input-group input-group-sm '+elementOculto+'"> \
							<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">Cant Personas</span> \
							<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_personas" readonly class="form-control" value="'+detalles[1]+'" /> \
						</div> \
					</div>';
		break;
		case 3:
			html = '';
		break;
		case 4:
			html = '<div class="col-sm-4"> \
						<div class="input-group input-group-sm '+elementOculto+'"> \
							<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">Kms Recorridos</span> \
							<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_kms" readonly class="form-control" value="'+detalleGasto+'" /> \
						</div> \
					</div>';
		break;
		case 5:
			html = '<div class="col-sm-4"> \
						<div class="input-group input-group-sm '+elementOculto+'"> \
							<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">Cant Viajes</span> \
							<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_viajes" readonly class="form-control" value="'+detalleGasto+'" /> \
						</div> \
					</div>';
		break;
		case 6:
			html = '';
		break;
		case 7:
			html = '';
		break;
		case 8:
			if(detalleGasto=='') detalleGasto = '0-0'; //Si el detalle del gasto proveniente del portal esta vacio, que en Gasolinas corresponde a litros de gasolina consumidos, guion medio y la cantidad de kilometros recorridos. Se establece en 0-0
			detalles = detalleGasto.split('-'); //Separamos el Str del Detalle por el guion medio para poder ser utilizado en dos campos diferentes
			html = '<div class="col-sm-4"> \
						<div class="input-group input-group-sm '+elementOculto+'"> \
							<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">Lts Consumidos</span> \
							<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_litros" readonly class="form-control" value="'+detalles[1]+'" /> \
						</div> \
						<div class="input-group input-group-sm '+elementOculto+'"> \
							<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">Kms Recorridos</span> \
							<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_kms" readonly class="form-control" value="'+detalles[0]+'" /> \
						</div> \
					</div> ';
		break;
		case 9:
			html = '';
		break;
		case 10:
			html = '<div class="col-sm-4"> \
						<div class="input-group input-group-sm '+elementOculto+'"> \
							<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">Cant Dias</span> \
							<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_dias" readonly class="form-control" value="'+detalleGasto+'" /> \
						</div> \
					</div>';
		break;
		case 11:
			if(detalleGasto=='') detalleGasto = '0-0'; //Si el detalle del gasto proveniente del portal esta vacio, que en Consumos Locales corresponde a cantidad de comidas, guion medio y la cantidad de personas. Se establece en 1-1
			detalles = detalleGasto.split('-'); //Separamos el Str del Detalle por el guion medio para poder ser utilizado en dos campos diferentes
			html = '<div class="col-sm-4"> \
						<div class="input-group input-group-sm"> \
							<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">Servicio</span> \
							<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_servicio" readonly class="form-control" value="'+serv+'" /> \
						</div> \
						<div class="input-group input-group-sm '+elementOculto+'"> \
							<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">Cant Comidas</span> \
							<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_comidas" readonly class="form-control" value="'+detalles[0]+'" /> \
						</div> \
						<div class="input-group input-group-sm '+elementOculto+'"> \
							<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">Cant Personas</span> \
							<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_personas" readonly class="form-control" value="'+detalles[1]+'" /> \
						</div> \
					</div>';
		break;
		case 12:
			html = '';
		break;
		case 13:
			if(detalleGasto=='') detalleGasto = '0-0'; //Si el detalle del gasto proveniente del portal esta vacio, que en Gasolinas corresponde a litros de gasolina consumidos, guion medio y la cantidad de kilometros recorridos. Se establece en 0-0
			detalles = detalleGasto.split('-'); //Separamos el Str del Detalle por el guion medio para poder ser utilizado en dos campos diferentes
			html = '<div class="col-sm-4"> \
						<div class="input-group input-group-sm '+elementOculto+'"> \
							<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">Lts Consumidos</span> \
							<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_litros" readonly class="form-control" value="'+detalles[1]+'" /> \
						</div> \
						<div class="input-group input-group-sm '+elementOculto+'"> \
							<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">Kms Recorridos</span> \
							<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_kms" readonly class="form-control" value="'+detalles[0]+'" /> \
						</div> \
					</div> ';
		break;
		case 14:
			//if(detalleGasto=='') detalleGasto = '0-0';
			//detalles = detalleGasto.split('-');
			html = '<div class="col-sm-4"> \
						<div class="input-group input-group-sm"> \
							<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">Servicio</span> \
							<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_servicio" readonly class="form-control" value="'+serv+'" /> \
						</div> \
					</div> \
					<br/><br/> \
					<div class="col-sm-8"> \
						<div class="input-group input-group-sm"> \
							<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">Tipo Otro Gasto</span> \
							<select class="form-control" disabled style="cursor: default;" id="tipo'+tipoGasto+'_fact'+countFact+'_tOgasto"> \
							'+selectOgastos+ '</select> \
						</div>\
					</div>'; //La selección del elemento del catalogo para el campo tipo17_fact[xfact]_tOgasto se realiza desde la función que lo mando a llamar creaFactCFDI(), creaConcptCFDI() o creaFactIMG() esto debido que en este punto el elemento aun no existe en el DOM de HTML, será hasta la posterior instrucción de innerHTML donde se haga la selección del elemennto.
		break;
		case 15:
			html = '';
		break;
		case 16:
			html = '<div class="col-sm-4"> \
					<div class="input-group input-group-sm '+elementOculto+'"> \
						<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">Cant Viajes</span> \
						<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_viajes" readonly class="form-control" value="'+detalleGasto+'" /> \
					</div> \
				</div>';
		break;
		case 17:
			if(detalleGasto=='') detalleGasto = '0-0'; //Si el detalle del gasto proveniente del portal esta vacio, que en Autos Utilitarios corresponde a ID de catalogo de Otros Gastos, guion medio y porcentaje de deducibilidad. Se establece en 0-0
			detalles = detalleGasto.split('-'); //Separamos el Str del Detalle por el guion medio para poder ser utilizado en dos campos diferentes
			html = '<div class="col-sm-4"> \
						<div class="input-group input-group-sm"> \
							<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">% deducibilidad</span> \
							<input type="text" id="tipo'+tipoGasto+'_fact'+countFact+'_deduci" readonly class="form-control" value="'+detalles[1]+'" /> \
						</div> \
					</div> \
					<br/><br/> \
					<div class="col-sm-8"> \
						<div class="input-group input-group-sm"> \
							<span class="input-group-addon" id="sizing-addon3" style="background-color: #FFF; font-weight: bold;">Tipo Otro Gasto</span> \
							<select class="form-control" disabled style="cursor: default;" id="tipo'+tipoGasto+'_fact'+countFact+'_tAutUti"> \
							'+selectGautUti+ '</select> \
						</div>\
					</div>'; //La selección del elemento del catalogo para el campo tipo17_fact[xfact]_tAutUti se realiza desde la función que lo mando a llamar creaFactCFDI(), creaConcptCFDI() o creaFactIMG() esto debido que en este punto el elemento aun no existe en el DOM de HTML, será hasta la posterior instrucción de innerHTML donde se haga la selección del elemennto.
		break;
	}
	//alert(html)
	return html; //Retorna el valor del String a la variable contenedora que llamo la función para posteriormente concatenarlos al String completo que contenga todo el codigo HTML que será enviado al DOM con la acción innerHTML
}
/*=======================
Función para mostrar las sumas de cada tipo de Gasto
=======================
Realiza la carga de valores de montos Deducible, No Deducible, IVA Acreditable e IVA No Acreditable de cada tipo de Gasto en su respectiva caja mto_tipo[x]_ded mto_tipo[x]_noded mto_tipo[x]_iva mto_tipo[x]_noiva donde x es el Id del tipo de gasto. Esto se realiza unicamente en la función cargaPagina(), pues recorrera el KWTG GV - SumasGastos el cual se encontrara poblado hasta que el formulario haya pasado por Contraloria.
 */
function cargaMontosSumas()
{
	for(var n = 1; n<= 25; n++) //Recorre maximo 25 veces cada Record del KWTG, buscando el ID del tipo de gasto (actualmente de 1 a 17 en Viaje y Varios)
	{
		var tipoGasto = document.getElementById('OBKey__604_'+n).value;
		var tipoG = parseInt(tipoGasto, 10);
		//console.log('iterador = ' + n + ' valorTipoGasto = ' + tipoG);

		if(tipoGasto != '') //Valida si el ID del tipo de Gasto no esta vacio
		{
			var siDed = dosDecim(document.getElementById('OBKey__605_'+n).value); //Obtiene Monto Deducible para el tipo de Gasto
			var noDec = dosDecim(document.getElementById('OBKey__606_'+n).value); //Obtiene Monto No Deducible para el tipo de Gasto
			var ivaAcre = dosDecim(document.getElementById('OBKey__607_'+n).value); //Obtiene Monto de IVA Acreditable para el tipo de Gasto
			var ivaNoAcre = dosDecim(document.getElementById('OBKey__608_'+n).value); //Obtiene Monto de IVA No Acreditable para el tipo de Gasto
			var ImpLoc = dosDecim(document.getElementById('OBKey__609_'+n).value); //Obtiene Monto de Impuesto Local para el tipo de Gasto
			var detalle = document.getElementById('OBKey__610_'+n).value; //Obtiene sumas de Detalles para el tipo de Gasto
			var serv = dosDecim(document.getElementById('OBKey__642_'+n).value); //Obtiene Monto de Propinas para el tipo de Gasto

			document.getElementById('mto_tipo'+tipoGasto+'_ded').innerHTML = siDed; //"Pinta" el valor de Deducible para tipo de gasto
			document.getElementById('mto_tipo'+tipoGasto+'_noded').innerHTML = noDec; //"Pinta" el valor de No Deducible para tipo de gasto
			document.getElementById('mto_tipo'+tipoGasto+'_iva').innerHTML = ivaAcre; //"Pinta" el valor de IVA Acreditable para tipo de gasto
			document.getElementById('mto_tipo'+tipoGasto+'_noiva').innerHTML = ivaNoAcre; //"Pinta" el valor de IVA No Acreditable para tipo de gasto

			//Muestra los elementos de Sumas de Detalle por Tipo de Gasto en los casos que aplica, por ejemplo en Hospedaje (Id = 1) Crea los campos Cant Noches, ISH y Propina, donde mostrara las sumas de cada uno de todos los comprobantes CFDI, CCFDI, IMG o SCOMP de su tipo
			switch (tipoG)
			{
				case 1:
					document.getElementById('sum_tipo'+tipoGasto+'_noches').value = detalle;
					document.getElementById('sum_tipo'+tipoGasto+'_ish').value = ImpLoc;
					document.getElementById('sum_tipo'+tipoGasto+'_serv').value = serv;
				break;
				case 2:
					detalles = detalle.split("-");
					document.getElementById('sum_tipo'+tipoGasto+'_comidas').value = detalles[0];
					document.getElementById('sum_tipo'+tipoGasto+'_personas').value = detalles[1];
					document.getElementById('sum_tipo'+tipoGasto+'_serv').value = serv;
				break;
				case 4:
					document.getElementById('sum_tipo'+tipoGasto+'_kms').value = detalle;
				break;
				case 5:
					document.getElementById('sum_tipo'+tipoGasto+'_viajes').value = detalle;
				break;
				case 8:
					detalles = detalle.split("-");
					document.getElementById('sum_tipo'+tipoGasto+'_litros').value = detalles[0];
					document.getElementById('sum_tipo'+tipoGasto+'_kms').value = detalles[1];
				break;
				case 10:
					document.getElementById('sum_tipo'+tipoGasto+'_dias').value = detalle;
				break;
			}
		}
		else
		{
			break;
		}
	}
}
/*=======================
Función para "truncar" a dos decimales
=======================
Recibe un valor string que a su vez proviene de algun valor float (por ejemplo una KW Float con 8 decimales), trunca el valor y lo devuelve en str
 */
function dosDecim(valor) 
{
	if(valor!='')
	{
    	return dosDec = valor.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0];
	}
	else
	{
		return valor;
	}
}
/*=======================
Función determina vs Reglas Fiscales AFKS Pol - Topes la deducibilidad de los comprobantes
=======================
Recorrera todos los comprobantes de cierto Tipo de Gasto, el cual recibe como parametro de entrada.
Es llamado desde la función validacionForm() bajo demanda del usuario de Contraloria con el boton "Valida Reglas y Suma Montos"
Su salida es la modificación de las KW's a través la función actualizaKW():
- Pos_Deducible, Pos_NoDeducible, Pos_IVAacre, Pos_IVAnoAcre, Pos_Servicio, Pos_ImpLocal, Pos_Remanente, Pos_Detalle a nivel KWTG GV - Posiciones por cada comprobante
- Sum_Deducible, Sum_NoDeducible, Sum_IVAacre, Sum_IVAnoAcre, Sum_Servicio, Sum_ImpLocal y Sum_Remanente
Asi como mostrar en pantalla en las cajas correspondientes los montos: mto_tipo[x]_tot, mto_tipo[x]_noiva, mto_tipo[x]_iva, mto_tipo[x]_noded, mto_tipo[x]_ded donde x es el tipo de gasto en curso
 */
function sumaMontos(tipoGasto)
{
	countFact = counts[tipoGasto]; //Obtiene Cantidad de comprobantes que se tienen por tipo de gasto
	errors[tipoGasto] = 0; //Establece la cantidad de errores en el array la variable global en cero
	var tipoG = parseInt(tipoGasto, 10); //Convierte tipo de gasto a tipo de dato entero
	var destinoViajeOr = document.getElementById('OBKey__590_1').value; //Obtiene la KW CatDetstino general en el DT, proveniente desde la captura inicial del usuario en el portal
	var nivelSolicitante = document.getElementById('OBKey__591_1').value; //Obtiene la KW NivelSolicitante general en el DT, proveniente de la consulta a Human y el AFKS GV - Cat Puestos/Niveles gestionado en WF
	var kmsGasolinaAnio = document.getElementById('OBKey__654_1').value; //Obtiene la KW Pol_TopeGasAño general en el DT, proveniente del AFKS GV - ControlAnual Kms Gasolina el cual contiene una actualización por empleado de la cantidad de Kms comprobados a lo largo del Año
	//Declara variables con ambito de la función para el control de datos mas adelante. 
	var topeFisEfectivo;
	var destinoViaje;
	var destinoCiudad;
	var pol_destino;
	var pol_nivel;
	var pol_TopeFiscNac;
	var pol_tFiscNac = false;
	var pol_TopeFiscExt;
	var pol_tFiscExt = false;
	var pol_NotasTopeFisc;
	var pol_unidadFis = 0;
	var pol_valUFis;
	var pol_TopeNadro;
	var pol_rest;
	var restric;
	var pol_tNadro = false;
	var pol_NotasTopeNadro;
	var pol_unidadNadro;
	var pol_valUNadro = 0;
	var idReg = 0;
	var valorIva = 0;
	var Msj ='';
	var encontrado = false;
	var topeKmsGasolina;

	if(destinoViajeOr == 'NACIONAL_CDMX') //Evalua si el destino del viaje es CDMX
	{
		destinoViaje = 'CDMX';
		destinoCiudad = 'CDMX';
	}
	else if(destinoViajeOr == 'EXTRANJERO') //Evalua si el destino del viaje es al EXTRANJERO
	{
		destinoViaje = 'EXTRANJERO';
	}
	else //Caso contrario a CDMX y EXTRANJERO se determina como nacional
	{
		destinoViaje = 'NACIONAL';
		var arrDestinoViajeOr = destinoViajeOr.split('_'); //Se separa el valor del campo Destino por guion bajo
		destinoCiudad = arrDestinoViajeOr[1];
	}
	for(var h=1; h<=10; h++) //Se recorre las KW del KWTG Pol - Campos 
	{
		var tipoCampo = document.getElementById('OBKey__472_'+h).value;
		if(tipoCampo == 'LIMIT_KMSGASOLINA') //Busca el valor del limite Anual de Gasolina
		{
			topeKmsGasolina = document.getElementById('OBKey__471_'+h).value;
		}
		if(tipoCampo == 'TOPEFIS_PAGOEFECTIVO') //Busca el valor del Tope Fiscal con pago en Efectivo
		{
			topeFisEfectivo = document.getElementById('OBKey__471_'+h).value;
		}
		if(tipoCampo == 'IVA') //Busca el valor de la tasa de IVA
		{
			valorIva = document.getElementById('OBKey__471_'+h).value;
		}
	}

	for(var n = 1; n<= 25; n++) //Recorre KW de KWTG Pol - Topes
	{
		var reg = document.getElementById('OBKey__385_'+n).value;
		if(reg==tipoGasto) //Evalua si el ID del Tipo de Gastos del registro en curso corresponde al que se esta trabajando en la función
		{
			//En caso de que si corresponda, se obtiene el destino y el nivel del KWTG Pol - Topes
			pol_destino = document.getElementById('OBKey__469_'+n).value;
			pol_nivel = document.getElementById('OBKey__470_'+n).value;
			//alert('n '+ n + ' reg '+ reg + ' pol_destino ' + pol_destino + ' pol_nivel ' + pol_nivel + ' destinoViaje ' + destinoViaje + ' nivelSolicitante ' + nivelSolicitante);
			if(pol_destino != '') //Evaluamos si para el tipo de gasto aplica control de destino, es decir no este vacio
			{
				if(pol_destino == destinoViaje) //Evaluamos si el destino encontrado en el KWTG Pol - Topes corresponde al destino de la comprobación en curso
				{
					pol_rest = document.getElementById('OBKey__510_'+n).value; //Obtiene del KWTG Pol - Topes el campo con el nivel de control de la regla KW Pol_Restrictivo 
					encontrado = true; //Establece en variable de entorno de la función que se encontró el registro con los topes para el tipo de gasto
				}
			}
			else if(pol_nivel != '') //Evalua si el nivel de empleado encontrado en el KWTG Pol Topes aplica como control, es decir no esta vacio
			{
				if(pol_nivel == nivelSolicitante) //Evaluamos si el nivel de empleado encontrado en el KWTG Pol - Topes corresponde al nivel del empleado de la comprobación en curso
				{
					pol_rest = document.getElementById('OBKey__510_'+n).value;
					encontrado = true; //Establece en variable de entorno de la función que se encontró el registro con los topes para el tipo de gasto
				}
			}
			else //Caso contrario obviamos que no aplica ningun control de Destino o Nivel de empleado para la regla de negocio
			{
				pol_rest = document.getElementById('OBKey__510_'+n).value;
				encontrado = true; //Establece en variable de entorno de la función que se encontró el registro con los topes para el tipo de gasto
			}
			if(encontrado) //Evaliamos nuestra variable encontrado que se definio en las lineas anteriores como true o como false desde un inicio si no cambio
			{
				if(destinoViaje=='EXTRANJERO') //Evaliamos si el destino del viaje es al Extranjero
				{
					pol_TopeFiscExt = document.getElementById('OBKey__512_'+n).value; //Obtenemos el vlaor del Tope Fiscal para Extranjero del KWTG Pol - Topes
					if(pol_TopeFiscExt != '') //Si el campo no esta vacio se establece la variable de control tFiscExt como true, lo que indica que si habrá una validación de este tipo para los comprobantes de es tipo de gasto
					{
						pol_tFiscExt = true;
					}
				}
				else
				{
					pol_TopeFiscNac = document.getElementById('OBKey__513_'+n).value; //Obtenemos el vlaor del Tope Fiscal para Nacional del KWTG Pol - Topes
					if(pol_TopeFiscNac != '') //Si el campo no esta vacio se establece la variable de control tFiscNac como true, lo que indica que si habrá una validación de este tipo para los comprobantes de es tipo de gasto
					{
						pol_tFiscNac = true;
					}
				}
				pol_NotasTopeFisc = document.getElementById('OBKey__464_'+n).value; //Obtenemos el vlaor de las notas de Tope Fiscal del KWTG Pol - Topes
				if(pol_NotasTopeFisc != '') //Si estas no estan vacias
				{
					var uf = pol_NotasTopeFisc.split("-"); //Separamos las notas por guion medio, en la admnistración del KWTG Pol - Topes las Notas del Tope Fiscal deberan iniciar siempre con la unidad que será evaluada por ejemplo PESOS o UMAS seguidos de un guión medio con el resto de la descripción de la regla de negocio que aplica
					pol_unidadFis = uf[0]; //Tomamos el valor antes del guión medio como unidad de la regla de Tope Fiscal
				}
				pol_TopeNadro = document.getElementById('OBKey__514_'+n).value; //Obtenemos el valor del Tope Nadro del AFKS Pol - Topes
				if(pol_TopeNadro != '') //Si es campo no esta vacio
				{
					pol_tNadro = true; //Establece en variable de entorno de la función que se encontró el registro con los topes Nadro para el tipo de gasto
				}
				pol_NotasTopeNadro = document.getElementById('OBKey__466_'+n).value; //Obtenemos el vlaor de las notas de Tope Nadro del KWTG Pol - Topes
				if(pol_NotasTopeNadro != '') //Si estas no estan vacias
				{
					var un = pol_NotasTopeNadro.split("-"); //Separamos las notas por guion medio, en la admnistración del KWTG Pol - Topes las Notas del Tope Nadro deberan iniciar siempre con la unidad que será evaluada por ejemplo PESOS o UMAS seguidos de un guión medio con el resto de la descripción de la regla de negocio que aplica
					pol_unidadNadro = un[0]; //Tomamos el valor antes del guión medio como unidad de la regla de Tope Nadro
				}
				idReg = n;
				//alert('TopeFiscNac ' + pol_TopeFiscNac);
				//alert('TopeFiscExt ' + pol_TopeFiscExt);
				//alert('NotasTopeFisc ' + pol_NotasTopeFisc);
				//alert('TopeNadro ' + pol_TopeNadro); 
				//alert('NotasTopeNadro ' + pol_NotasTopeNadro);
				//alert('Restrictivo ' + pol_rest);
				//alert('idReg ' + idReg);
				break;
			}
		}
	}

	//var arrpol_rest = pol_rest.split('-');

	for(var i = 1; i<= countFact; i++) //Recorre todos los comprobantes del tipo de gasto
	{
		//Obtiene datos generales del comprobante a partir de los campos creados en el cuerpo del fomulario. No de KW: Handle, Tipo Comprobante (CFDI, IMG, SCOMP), SubTotal, Total, IVA, Tipo principal de Pago, Cantidad de Conceptos en el caso de CFDI, Desgloce de Conceptos en caso de haber conceptos con Tipo de Gasto distinto al del CFDI
		handle = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_handle').value;
		tipoFact = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_tipoFact').value;
		totalFact = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_totFact').value);
		subtot = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_subtotFact').value);
		iva = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaFact').value);
		tipoPago = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_tPago').value;
		cantItems = parseInt(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_cantItems').value, 10);
		desgloce = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_desgloce').value;
		//Obtiene datos particulaes del comprobante con respecto al Tipo de Gasto a partir de los campos creados en el cuerpo del fomulario. No de KW: Cant Noches
		noches = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_noches').value);

		var otro_subtot = 0;
		var otro_iva = 0;
		if(desgloce!='') //Evalua si existe separación de conceptos del CFDI
		{
			subtot = 0;
			iva = 0;
			for(r=1;r<=250;r++) //Recorrera cada concepto del CFDI... En este caso particular si va directo a los inputs del HTML que corresponden a los valores de KW del KWTG FE - Conceptos
			{
				handleItem = document.getElementById('OBKey__572_'+r).value;
				if(handleItem!='')//Asegura que el Handle del Registro del KWTG FE - Conceptos no este vacio
				{
					if(handleItem==handle) //Valida que el Handle del Concepto corresponda al mismo handle del Comprobante principal
					{
						tGastoItem = document.getElementById('OBKey__620_'+r).value;

						if(tipoGasto==tGastoItem) //Valida si el Tipo de Gasto del Concepto encontrado con el mismo Handle es igual al Tipo de Gasto del CFDI principal
						{
							subtot = subtot + parseFloat(document.getElementById('OBKey__195_'+r).value);
							tmp_iva = document.getElementById('OBKey__504_'+r).value;
							if(tmp_iva!='') //Valida que el concepto encontrado contenga IVA
							{
								iva = iva + parseFloat(tmp_iva); //Suma el monto del IVA en Acumulador principal de IVA
							}
						}
						else //Caso contrario en que el Concepto no corresponda al mismo Tipo de Gasto que el CFDI
						{
							otro_subtot = otro_subtot + parseFloat(document.getElementById('OBKey__195_'+r).value);
							otrotmp_iva = document.getElementById('OBKey__504_'+r).value;
							if(otrotmp_iva!='') //Valida que el concepto encontrado contenga IVA
							{
								otro_iva = otro_iva + parseFloat(otrotmp_iva); //Suma el monto del IVA en Acumulador alterno de IVA
							}
						}

					}
				}
				else //Si el Handle esta vacio, deja de continuar recorriendo los Records del KWTG FE - Conceptos 
				{
					break;
				}
			}
		}

		var subtotDed = 0;
		var subtotNoDed = 0;
		var ivaAcred = 0;
		var ivaNoAcred = 0;

		var subtotDed8 = 0;
		var subtotNoDed8 = 0;
		var ivaAcred8 = 0;
		var ivaNoAcred8 = 0;

		var subtotDed0 = 0;
		var subtotNoDed0 = 0;
		var ivaAcred0 = 0;
		var ivaNoAcred0 = 0;

		var unidadPorcentaje = 0;

		/*========================================
		Inicia TEMP Divide IVAs
		==========================================*/

		var subTot16 = 0.0;
		var subTot8 = 0.0;
		var	subTot0 = 0.0;
		var mtoIva16 = 0.0;
		var mtoIva8 = 0.0;
		var mtoIva0 = 0.0;

		for(r=1;r<=250;r++) //Recorrera cada concepto del CFDI... En este caso particular si va directo a los inputs del HTML que corresponden a los valores de KW del KWTG FE - Conceptos
		{
			handleItem = document.getElementById('OBKey__572_'+r).value;
			if(handleItem!='')//Asegura que el Handle del Registro del KWTG FE - Conceptos no este vacio
			{
				if(handleItem==handle) //Valida que el Handle del Concepto corresponda al mismo handle del Comprobante principal
				{
					var tasa = document.getElementById('OBKey__505_'+r).value;
					var cImporte = parseFloat(document.getElementById('OBKey__105_'+r)).value;
					var tImporte = parseFloat(document.getElementById('OBKey__504_'+r)).value;

					switch (tasa)
					{
						case '0.16':
							subTot16 += cImporte;
							mtoIva16 += tImporte;
						break;

						case '0.08':
							subTot8 += cImporte;
							mtoIva8 += tImporte;
						break;

						case '0':
							subTot0 += cImporte;
							mtoIva0 += tImporte;
						break;
					}
				}
			}
			else //Si el Handle esta vacio, deja de continuar recorriendo los Records del KWTG FE - Conceptos 
			{
				break;
			}
		}

		console.log('subTot16 ' + subTot16);
		console.log('subTot8 ' + subTot8);
		console.log('subTot0 ' + subTot0);
		console.log('mtoIva16 ' + mtoIva16);
		console.log('mtoIva8 ' + mtoIva8);
		console.log('mtoIva0 ' + mtoIva0);

		/*========================================
		Inicia TEMP Divide IVAs
		==========================================*/

		if((tipoFact == 'IMG') || (tipoFact == 'SCOMP')) //Si el tipo de COmprobante es igual a IMG o SCOMP automaticamente se determina todo el comprobante como no deducible e IVA no acreditable
		{
			subtotDed = 0;
			subtotNoDed = subtot; //El Subtotal del COmprobante se determina como No Deducible
			ivaAcred = 0;
			ivaNoAcred = iva; //En caso de existir IVA, se determina como no Acreditable
		}
		else //Caso contrario se considera como CFDI o un Concepto de CFDI (CCFDI)
		{
			if(tipoPago=='1') //Si el tipo de pago principal (EL DE MAYOR MONTO INGRESADO POR EL USUARIO EN EL PORTAL) es igual a 1 (Efectivo)
			{
				if(totalFact<=topeFisEfectivo) //Valida si el monto total del comprobante es menor al tipeFiscal obtenido del AFKS Pol - Campos diversos
				{
					if(pol_tFiscExt) //Evalua si para el tipo de gasto aplica validación de Tope Fiscal Extranjero (solo cuando la comprobación sea extranjera)	
					{
						if(pol_unidadFis=='PESOS') //Evalua si la unidad de control del Tope Fiscal es en PESOS
						{
							if(subtot>pol_TopeFiscExt) //Evalua si el subtotal del comprobante es mayor al Tope Fiscal aplicable
							{
								subtotDed = pol_TopeFiscExt; //Determina el monto del Tope Fiscal como cantidad deducible del gasto
								subtotNoDed = subtot - pol_TopeFiscExt; //Resta el Tope Fiscal menos el subtotal del comprobante y eso se considera no deducible
								ivaAcred = pol_TopeFiscExt * valorIva; //Multiplica el Tope Fiscal por la Tasa de IVA (Obtenida de AFKS - Campos diversos), eso se considera IVA Acreditable
								ivaNoAcred = iva - ivaAcred; //Resta el IVA del COmprobante menos el IVA determinado como acreditable para definir la cantidad de IVA no Acreditable
							}
							else //En caso que el subtotal del comprobante no sea mayor al Tope Fiscal
							{
								subtotDed = subtot; //Se establece la totalidad del subtotal del comprobante como Deducible
								subtotNoDed = 0; //No hay monto No Deducible en este caso
								ivaAcred = iva; //Todo el IVA del Comprobante es Acreditable
								ivaNoAcred = 0; //No hay monto de IVA No Acreditable
							}
						}
						if(pol_unidadFis=='%') //Evalua si la unidad de control del Tope Fiscal es en porcentaje
						{
							subtotDed = subtot * pol_TopeFiscExt; //Multiplica el subtotal del Comprobante por el Tope Fiscal (Cuando sea % debera estar en el AFKS Pol - Topes en decimal, ejemplo 0.2 para 20% o 0.085 para 8.5%). La cantidad obtenida se determina como deducible
							subtotNoDed = subtot - subtotDed; //Resta el subtotal del Comprobante menos la parte deducible, para determinar la parte no deducible
							ivaAcred = iva * pol_TopeFiscExt; //Multiplica el IVA del Comprobante por el Tope Fiscal (Cuando sea % debera estar en el AFKS Pol - Topes en decimal, ejemplo 0.2 para 20% o 0.085 para 8.5%). La cantidad obtenida se determina como IVA Acreditable
							ivaNoAcred = iva - ivaAcred; //Resta el IVA del comprobante menos el IVA Acreditable para obtener el IVA no Acreditable
						}
					}
					else if(pol_tFiscNac) //Evalua si para el tipo de gasto aplica validación de Tope Fiscal nacional
					{
						if(pol_unidadFis=='PESOS') //Evalua si la unidad de control del Tope Fiscal es en PESOS
						{
							if(subtot>pol_TopeFiscNac) //Evalua si el subtotal del comprobante es mayor al Tope Fiscal aplicable
							{
								subtotDed = pol_TopeFiscNac; //Determina el monto del Tope Fiscal como cantidad deducible del gasto
								subtotNoDed = subtot - pol_TopeFiscNac; //Resta el Tope Fiscal menos el subtotal del comprobante y eso se considera no deducible
								ivaAcred = pol_TopeFiscNac * valorIva; //Multiplica el Tope Fiscal por la Tasa de IVA (Obtenida de AFKS - Campos diversos), eso se considera IVA Acreditable
								ivaNoAcred = iva - ivaAcred; //Resta el IVA del COmprobante menos el IVA determinado como acreditable para definir la cantidad de IVA no Acreditable
								
								subtotDed8 = 0;
								subtotNoDed8 = 0;
								ivaAcred8 = 0;
								ivaNoAcred8 = 0;

								subtotDed0 = 0;
								subtotNoDed0 = 0;
								ivaAcred0 = 0;
								ivaNoAcred0 = 0;

								subTot16 = 0.0;
								subTot8 = 0.0;
								subTot0 = 0.0;
								mtoIva16 = 0.0;
								mtoIva8 = 0.0;
								mtoIva0 = 0.0;
							}
							else //En caso que el subtotal del comprobante no sea mayor al Tope Fiscal
							{
								subtotDed = subtot; //Se establece la totalidad del subtotal del comprobante como Deducible
								subtotNoDed = 0; //No hay monto No Deducible en este caso
								ivaAcred = iva; //Todo el IVA del Comprobante es Acreditable
								ivaNoAcred = 0; //No hay monto de IVA No Acreditable
							}
							
						}
						if(pol_unidadFis=='%') //Evalua si la unidad de control del Tope Fiscal es en porcentaje
						{
							subtotDed = subtot * pol_TopeFiscNac; //Multiplica el subtotal del Comprobante por el Tope Fiscal (Cuando sea % debera estar en el AFKS Pol - Topes en decimal, ejemplo 0.2 para 20% o 0.085 para 8.5%). La cantidad obtenida se determina como deducible
							subtotNoDed = subtot - subtotDed; //Resta el subtotal del Comprobante menos la parte deducible, para determinar la parte no deducible
							ivaAcred = iva * pol_TopeFiscNac; //Multiplica el IVA del Comprobante por el Tope Fiscal (Cuando sea % debera estar en el AFKS Pol - Topes en decimal, ejemplo 0.2 para 20% o 0.085 para 8.5%). La cantidad obtenida se determina como IVA Acreditable
							ivaNoAcred = iva - ivaAcred; //Resta el IVA del comprobante menos el IVA Acreditable para obtener el IVA no Acreditable
						}
					}
					else //En caso de no existir Tope Fiscal ni Nacional ni Extranjero para el tipo de gasto
					{
						subtotDed = subtot; //Se establece la totalidad del subtotal del comprobante como Deducible
						subtotNoDed = 0; //No hay monto No Deducible en este caso
						ivaAcred = iva; //Todo el IVA del Comprobante es Acreditable
						ivaNoAcred = 0; //No hay monto de IVA No Acreditable
					}
				}
				else //En caso que el monto total del comprobante ses mayor al Tope Fiscal de pago en Efectivo
				{
					subtotDed = 0;
					subtotNoDed = subtot; //El Subtotal del COmprobante se determina como No Deducible
					ivaAcred = 0;
					ivaNoAcred = iva; //Todo el IVA se determina como No Acreditable
				}
			}
			else //En caso que el Tipo de pago principal (EL DE MAYOR MONTO INGRESADO POR EL USUARIO EN EL PORTAL) sea distinto a Efectivo
			{
				if(pol_tFiscExt) //Evalua si para el tipo de gasto aplica validación de Tope Fiscal Extranjero (solo cuando la comprobación sea extranjera)	
					{
						if(pol_unidadFis=='PESOS') //Evalua si la unidad de control del Tope Fiscal es en PESOS
						{
							if(subtot>pol_TopeFiscExt) //Evalua si el subtotal del comprobante es mayor al Tope Fiscal aplicable
							{
								subtotDed = pol_TopeFiscExt; //Determina el monto del Tope Fiscal como cantidad deducible del gasto
								subtotNoDed = subtot - pol_TopeFiscExt; //Resta el Tope Fiscal menos el subtotal del comprobante y eso se considera no deducible
								ivaAcred = pol_TopeFiscExt * valorIva; //Multiplica el Tope Fiscal por la Tasa de IVA (Obtenida de AFKS - Campos diversos), eso se considera IVA Acreditable
								ivaNoAcred = iva - ivaAcred; //Resta el IVA del COmprobante menos el IVA determinado como acreditable para definir la cantidad de IVA no Acreditable
							}
							else //En caso que el subtotal del comprobante no sea mayor al Tope Fiscal
							{
								subtotDed = subtot; //Se establece la totalidad del subtotal del comprobante como Deducible
								subtotNoDed = 0; //No hay monto No Deducible en este caso
								ivaAcred = iva; //Todo el IVA del Comprobante es Acreditable
								ivaNoAcred = 0; //No hay monto de IVA No Acreditable
							}
						}
						if(pol_unidadFis=='%') //Evalua si la unidad de control del Tope Fiscal es en porcentaje
						{
							subtotDed = subtot * pol_TopeFiscExt; //Multiplica el subtotal del Comprobante por el Tope Fiscal (Cuando sea % debera estar en el AFKS Pol - Topes en decimal, ejemplo 0.2 para 20% o 0.085 para 8.5%). La cantidad obtenida se determina como deducible
							subtotNoDed = subtot - subtotDed; //Resta el subtotal del Comprobante menos la parte deducible, para determinar la parte no deducible
							ivaAcred = iva * pol_TopeFiscExt; //Multiplica el IVA del Comprobante por el Tope Fiscal (Cuando sea % debera estar en el AFKS Pol - Topes en decimal, ejemplo 0.2 para 20% o 0.085 para 8.5%). La cantidad obtenida se determina como IVA Acreditable
							ivaNoAcred = iva - ivaAcred; //Resta el IVA del comprobante menos el IVA Acreditable para obtener el IVA no Acreditable
						}
					}
					else if(pol_tFiscNac) //Evalua si para el tipo de gasto aplica validación de Tope Fiscal nacional
					{
						if(pol_unidadFis=='PESOS') //Evalua si la unidad de control del Tope Fiscal es en PESOS
						{
							if(subtot>pol_TopeFiscNac) //Evalua si el subtotal del comprobante es mayor al Tope Fiscal aplicable
							{
								subtotDed = pol_TopeFiscNac; //Determina el monto del Tope Fiscal como cantidad deducible del gasto
								subtotNoDed = subtot - pol_TopeFiscNac; //Resta el Tope Fiscal menos el subtotal del comprobante y eso se considera no deducible
								ivaAcred = pol_TopeFiscNac * valorIva; //Multiplica el Tope Fiscal por la Tasa de IVA (Obtenida de AFKS - Campos diversos), eso se considera IVA Acreditable
								ivaNoAcred = iva - ivaAcred; //Resta el IVA del COmprobante menos el IVA determinado como acreditable para definir la cantidad de IVA no Acreditable
							}
							else //En caso que el subtotal del comprobante no sea mayor al Tope Fiscal
							{
								subtotDed = subtot; //Se establece la totalidad del subtotal del comprobante como Deducible
								subtotNoDed = 0; //No hay monto No Deducible en este caso
								ivaAcred = iva; //Todo el IVA del Comprobante es Acreditable
								ivaNoAcred = 0; //No hay monto de IVA No Acreditable
							}
							
						}
						if(pol_unidadFis=='%') //Evalua si la unidad de control del Tope Fiscal es en porcentaje
						{
							subtotDed = subtot * pol_TopeFiscNac; //Multiplica el subtotal del Comprobante por el Tope Fiscal (Cuando sea % debera estar en el AFKS Pol - Topes en decimal, ejemplo 0.2 para 20% o 0.085 para 8.5%). La cantidad obtenida se determina como deducible
							subtotNoDed = subtot - subtotDed; //Resta el subtotal del Comprobante menos la parte deducible, para determinar la parte no deducible
							ivaAcred = iva * pol_TopeFiscNac; //Multiplica el IVA del Comprobante por el Tope Fiscal (Cuando sea % debera estar en el AFKS Pol - Topes en decimal, ejemplo 0.2 para 20% o 0.085 para 8.5%). La cantidad obtenida se determina como IVA Acreditable
							ivaNoAcred = iva - ivaAcred; //Resta el IVA del comprobante menos el IVA Acreditable para obtener el IVA no Acreditable
						}
					}
					else //En caso de no existir Tope Fiscal ni Nacional ni Extranjero para el tipo de gasto
					{
						subtotDed = subtot; //Se establece la totalidad del subtotal del comprobante como Deducible
						subtotNoDed = 0; //No hay monto No Deducible en este caso
						ivaAcred = iva; //Todo el IVA del Comprobante es Acreditable
						ivaNoAcred = 0; //No hay monto de IVA No Acreditable
					}
			}
		}

		switch(tipoG)
		{
			//Definición de campos especificos por tipo de gasto
			case 1:
				remamente = (totalFact - ((otro_subtot + otro_iva) + (subtot + iva))).toFixed(2); //Se determina si existe algun remanente de la suma de los IVAS y Subtotales contra el Total Neto del Comprobante
				if(remamente<0) //Si el remanente es menor a cero se determina como no existente
				{
					document.getElementById('tipo'+tipoGasto+'_fact'+i+'_remamente').value = 0;
					document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ish').value = 0;
					actualizaKW('posicion', tipoGasto, handle, 'remamente', 0);
					actualizaKW('posicion', tipoGasto, handle, 'impLoc', 0);
				}
				else //Si el remanente si es mayor a cero se envia a los campos de remanente y se suma a la parte no Deducible del comprobante
				{
					document.getElementById('tipo'+tipoGasto+'_fact'+i+'_remamente').value = dosDecim(remamente);
					document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ish').value = dosDecim(remamente);
					actualizaKW('posicion', tipoGasto, handle, 'remamente', dosDecim(remamente));
					actualizaKW('posicion', tipoGasto, handle, 'impLoc', dosDecim(remamente));
					subtotNoDed = (parseFloat(subtotNoDed) + parseFloat(remamente)).toFixed(2);
				}
				break;
		}

		servicio = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_servicio').value);
		if(servicio>0) //En caso de existir propina en el comprobante, esta se suma a la parte No Deducible del Comprobante
		{
			subtotNoDed = (parseFloat(subtotNoDed) + parseFloat(servicio)).toFixed(2);
		}

		//alert('Rubro='+ tipoG +'\n pol_tFiscNac=' + pol_tFiscNac + '\n pol_tFiscExt=' + pol_tFiscExt + '\n pol_unidadFis=' + pol_unidadFis + '\n valorIva=' + valorIva + '\n subtot=' + subtot + '\n iva=' + iva  + '\n pol_TopeFiscNac=' + pol_TopeFiscNac + '\n subtotDed=' + subtotDed + '\n subtotNoDed=' + subtotNoDed + '\n ivaAcred=' + ivaAcred + '\n ivaNoAcred=' + ivaNoAcred);

		//Se actualizan los montos Deducible, No Deducible, IVA Acreditable e IVA No Acreditable en la parte Gráfica de los capos del comprobante en el Formulario y en las KW's correspondientes en el KWTG GV - Posiciones
		document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ded').value = dosDecim(subtotDed);
		document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaAcre').value = dosDecim(ivaAcred);
		document.getElementById('tipo'+tipoGasto+'_fact'+i+'_noded').value = dosDecim(subtotNoDed);
		document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaNoAcre').value = dosDecim(ivaNoAcred);
		actualizaKW('posicion', tipoGasto, handle, 'ded', dosDecim(subtotDed));
		actualizaKW('posicion', tipoGasto, handle, 'ivaAcre', dosDecim(ivaAcred));
		actualizaKW('posicion', tipoGasto, handle, 'noDed', dosDecim(subtotNoDed));
		actualizaKW('posicion', tipoGasto, handle, 'ivaNoAcre', dosDecim(ivaNoAcred));

	}

	//Al termino de recorrer todos los comproantes del tipo de gasto, se determinan las variables acumuladoras siguientes
	var sumDed = 0.0;
	var sumNoDed = 0.0;
	var sumIVA = 0.0;
	var sumNoIVA = 0.0;
	var sumImpLoc = 0.0;
	var sumServ = 0.0;
	var sumNoches = 0;
	var sumReman = 0;
	for(var n = 1; n<= countFact; n++) //Volvemos a recorrer todos los comprobantes del Tipo de Gasto
	{
		var ded = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ded').value; //Obtiene la parte Deducible del Comprobante
		if (ded=='') ded = 0; //Evalua si esta vacia la parte Deducible y en ese caso la establece en cero
		sumDed = ((parseFloat(sumDed) + parseFloat(ded))).toFixed(2); //Suma en la variable acumuladora la parte Deducible
		var NoDed = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_noded').value; //Obtiene la parte No Deducible del Comprobante
		if (NoDed=='') NoDed = 0; //Evalua si esta vacia la parte No Deducible y en ese caso la establece en cero
		sumNoDed = ((parseFloat(sumNoDed) + parseFloat(NoDed))).toFixed(2); //Suma en la variable acumuladora la parte No Deducible
		var iva = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ivaAcre').value; //Obtiene la parte de IVA Acreditable del Comprobante
		if (iva=='') iva = 0; //Evalua si esta vacia la parte de IVA Acreditable y en ese caso la establece en cero
		sumIVA = ((parseFloat(sumIVA) + parseFloat(iva))).toFixed(2); //Suma en la variable acumuladora la parte de IVA Acreditable
		var noIVA = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ivaNoAcre').value; //Obtiene la parte de IVA No Acreditable del Comprobante
		if (noIVA=='') noIVA = 0; //Evalua si esta vacia la parte de IVA No Acreditable y en ese caso la establece en cero
		sumNoIVA = ((parseFloat(sumNoIVA) + parseFloat(noIVA))).toFixed(2); //Suma en la variable acumuladora la parte de IVA No Acreditable
		var ImpLoc = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ish').value; //Obtiene la parte de Impuesto Local (ISH) del Comprobante
		if (ImpLoc=='') ImpLoc = 0; //Evalua si esta vacia la parte de Impuesto Local (ISH) y en ese caso la establece en cero
		sumImpLoc = ((parseFloat(sumImpLoc) + parseFloat(ImpLoc))).toFixed(2); //Suma en la variable acumuladora la parte de Impuesto Local (ISH)
		var serv = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_servicio').value; //Obtiene la parte de Propina del Comprobante
		if (serv=='') serv = 0; //Evalua si esta vacia la parte de Propina y en ese caso la establece en cero
		sumServ = ((parseFloat(sumServ) + parseFloat(serv))).toFixed(2); //Suma en la variable acumuladora la parte de Propina
		var noches = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_noches').value; //Obtiene la parte de Cantidad de noches de Hospedaje del Comprobante
		if (noches=='') noches = 0; //Evalua si esta vacia la parte de Cant Noches y en ese caso la establece en cero
		sumNoches = ((parseFloat(sumNoches) + parseFloat(noches))).toFixed(2); //Suma en la variable acumuladora la parte de Cant Noches
		var remamente = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_remamente').value; //Obtiene la parte de Remanente del Comprobante
		if (remamente=='') remamente = 0; //Evalua si esta vacia la parte de Remanente y en ese caso la establece en cero
		sumReman = ((parseFloat(sumReman) + parseFloat(remamente))).toFixed(2); //Suma en la variable acumuladora la parte de Remanente
		//alert('xFact n='+n+' sumDed='+ sumDed +' sumNoDed='+sumNoDed);
	}

	//Se actualizan los montos Deducible, No Deducible, IVA Acreditable e IVA No Acreditable en la parte Grafica de los capos del comprobante en el Formulario y en las KW's correspondientes en el KWTG GV - Sumas
	document.getElementById('sum_tipo'+tipoGasto+'_serv').value = dosDecim(sumServ);
	document.getElementById('sum_tipo'+tipoGasto+'_noches').value = dosDecim(sumNoches);
	document.getElementById('sum_tipo'+tipoGasto+'_ish').value = dosDecim(sumImpLoc);
	
	document.getElementById('mto_tipo'+tipoGasto+'_ded').innerHTML = dosDecim(sumDed);
	document.getElementById('mto_tipo'+tipoGasto+'_noded').innerHTML = dosDecim(sumNoDed);
	document.getElementById('mto_tipo'+tipoGasto+'_iva').innerHTML = dosDecim(sumIVA);
	document.getElementById('mto_tipo'+tipoGasto+'_noiva').innerHTML = dosDecim(sumNoIVA);

	actualizaKW('sumas', tipoGasto, '', 'ded', dosDecim(sumDed));
	actualizaKW('sumas', tipoGasto, '', 'noDed', dosDecim(sumNoDed));
	actualizaKW('sumas', tipoGasto, '', 'ivaAcre', dosDecim(sumIVA));
	actualizaKW('sumas', tipoGasto, '', 'ivaNoAcre', dosDecim(sumNoIVA));
	actualizaKW('sumas', tipoGasto, '', 'serv', dosDecim(sumServ));
	actualizaKW('sumas', tipoGasto, '', 'impLoc', dosDecim(sumImpLoc));
	actualizaKW('sumas', tipoGasto, '', 'detGast', dosDecim(sumNoches));

	//Suma al Total Neto de la comprobación los montos obtenidos
	sumTotDed = (parseFloat(sumTotDed) + parseFloat(sumDed)).toFixed(2);
	sumTotNoDed = (parseFloat(sumTotNoDed) + parseFloat(sumNoDed)).toFixed(2);
	sumTotIVAAcre = (parseFloat(sumTotIVAAcre) + parseFloat(sumIVA)).toFixed(2);
	sumTotIVAnoAcre = (parseFloat(sumTotIVAnoAcre) + parseFloat(sumNoIVA)).toFixed(2);
	sumTotComp = (parseFloat(sumTotComp) + parseFloat(sumDed) + parseFloat(sumNoDed) + parseFloat(sumIVA) + parseFloat(sumNoIVA)).toFixed(2);

	//La validación por cada Comprobante de cada tipo de gasto se realiza a continuación, se tiene en un Switch Case y con codigo repetido debido a que en el usuario dijo en todo momento que cada tipo de gasto tiene distintas validaciones y distintas reglas que determinarian que sea deducible o no, por lo que se determinó que cada tipo de gasto fuera un case distinto
	//Sin embargo al termino del desarrollo de este formulario (Mayo-2018) todos los casos conllevan el mismo tratamiento, por lo que solo encontrará comentado el codigo del Tipo de gasto 1
	
	/*
	switch(tipoG)
	{
		//Validaciones Fiscales y determinación de montos deducibles para Tipo Gasto 1 (Hospedaje)
		case 1:
		break;
		case 2:
			for(var i = 1; i<= countFact; i++)
			{
				//alert(i);

				handle = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_handle').value;
				tipoFact = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_tipoFact').value;
				totalFact = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_totFact').value);
				subtot = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_subtotFact').value);
				iva = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaFact').value);
				tipoPago = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_tPago').value;
				cantItems = parseInt(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_cantItems').value, 10);
				desgloce = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_desgloce').value;
				var desgloces = desgloce.split('-');
				var otro_subtot = 0;
				var otro_iva = 0;
				
				if(desgloce!='')
				{
					subtot = 0;
					iva = 0;
					for(r=1;r<=250;r++)
					{
						handleItem = document.getElementById('OBKey__572_'+r).value;
						if(handleItem!='')
						{
							if(handleItem==handle)
							{
								tGastoItem = document.getElementById('OBKey__620_'+r).value;

								if(tipoGasto==tGastoItem)
								{
									subtot = subtot + parseFloat(document.getElementById('OBKey__195_'+r).value);
									tmp_iva = document.getElementById('OBKey__504_'+r).value;
									if(tmp_iva!='')
									{
										iva = iva + parseFloat(tmp_iva);
									}
								}
								else
								{
									otro_subtot = otro_subtot + parseFloat(document.getElementById('OBKey__195_'+r).value);
									otrotmp_iva = document.getElementById('OBKey__504_'+r).value;
									if(otrotmp_iva!='')
									{
										otro_iva = otro_iva + parseFloat(otrotmp_iva);
									}
								}

							}
						}
						else
						{
							break;
						}
					}
				}

				var subtotDed = 0;
				var subtotNoDed = 0;
				var ivaAcred = 0;
				var ivaNoAcred = 0;
				var unidadPorcentaje = 0;
				if((tipoFact == 'IMG') || (tipoFact == 'SCOMP'))
				{
					subtotDed = 0;
					subtotNoDed = subtot;
					ivaAcred = 0;
					ivaNoAcred = iva;
				}
				else
				{
					if(tipoPago=='1')
					{
						if(totalFact<=topeFisEfectivo)
						{
							if(pol_tFiscExt)	
							{
								if(pol_unidadFis=='PESOS')
								{
									if(subtot>pol_TopeFiscExt)
									{
										subtotDed = pol_TopeFiscExt;
										subtotNoDed = subtot - pol_TopeFiscExt;
										ivaAcred = pol_TopeFiscExt * valorIva;
										ivaNoAcred = iva - ivaAcred;
									}
									else
									{
										subtotDed = subtot;
										subtotNoDed = 0;
										ivaAcred = iva;
										ivaNoAcred = 0;
									}
								}
								if(pol_unidadFis=='%')
								{
									subtotDed = subtot * pol_TopeFiscExt;
									subtotNoDed = subtot - subtotDed;
									ivaAcred = iva * pol_TopeFiscExt;
									ivaNoAcred = iva - ivaAcred;
								}
							}
							else if(pol_tFiscNac)
							{
								if(pol_unidadFis=='PESOS')
								{
									if(subtot>pol_TopeFiscNac)
									{
										subtotDed = pol_TopeFiscNac;
										subtotNoDed = subtot - pol_TopeFiscNac;
										ivaAcred = pol_TopeFiscNac * valorIva;
										ivaNoAcred = iva - ivaAcred;
									}
									else
									{
										subtotDed = subtot;
										subtotNoDed = 0;
										ivaAcred = iva;
										ivaNoAcred = 0;
									}
									
								}
								if(pol_unidadFis=='%')
								{
									subtotDed = subtot * pol_TopeFiscNac;
									subtotNoDed = subtot - subtotDed;
									ivaAcred = iva * pol_TopeFiscNac;
									ivaNoAcred = iva - ivaAcred;
								}
							}
							else
							{
								subtotDed = subtot;
								subtotNoDed = 0;
								ivaAcred = iva;
								ivaNoAcred = 0;
							}
						}
						else
						{
							subtotDed = 0;
							subtotNoDed = subtot;
							ivaAcred = 0;
							ivaNoAcred = iva;
						}
					}
					else
					{
						if(pol_tFiscExt)	
						{
							if(pol_unidadFis=='PESOS')
							{
								if(subtot>pol_TopeFiscExt)
								{
									subtotDed = pol_TopeFiscExt;
									subtotNoDed = subtot - pol_TopeFiscExt;
									ivaAcred = pol_TopeFiscExt * valorIva;
									ivaNoAcred = iva - ivaAcred;
								}
								else
								{
									subtotDed = subtot;
									subtotNoDed = 0;
									ivaAcred = iva;
									ivaNoAcred = 0;
								}
							}
							if(pol_unidadFis=='%')
							{
								subtotDed = subtot * pol_TopeFiscExt;
								subtotNoDed = subtot - subtotDed;
								ivaAcred = iva * pol_TopeFiscExt;
								ivaNoAcred = iva - ivaAcred;
							}
						}
						else if(pol_tFiscNac)
						{
							if(pol_unidadFis=='PESOS')
							{
								if(subtot>pol_TopeFiscNac)
								{
									subtotDed = pol_TopeFiscNac;
									subtotNoDed = subtot - pol_TopeFiscNac;
									ivaAcred = pol_TopeFiscNac * valorIva;
									ivaNoAcred = iva - ivaAcred;
								}
								else
								{
									subtotDed = subtot;
									subtotNoDed = 0;
									ivaAcred = iva;
									ivaNoAcred = 0;
								}
								
							}
							if(pol_unidadFis=='%')
							{
								subtotDed = subtot * pol_TopeFiscNac;
								subtotNoDed = subtot - subtotDed;
								ivaAcred = iva * pol_TopeFiscNac;
								ivaNoAcred = iva - ivaAcred;
							}
						}
						else
						{
							subtotDed = subtot;
							subtotNoDed = 0;
							ivaAcred = iva;
							ivaNoAcred = 0;
						}
					}
				}
				
				//alert('Rubro='+ tipoG +'\n pol_tFiscNac=' + pol_tFiscNac + '\n pol_tFiscExt=' + pol_tFiscExt + '\n pol_unidadFis=' + pol_unidadFis + '\n valorIva=' + valorIva + '\n subtot=' + subtot + '\n iva=' + iva  + '\n pol_TopeFiscNac=' + pol_TopeFiscNac + '\n subtotDed=' + subtotDed + '\n subtotNoDed=' + subtotNoDed + '\n ivaAcred=' + ivaAcred + '\n ivaNoAcred=' + ivaNoAcred);

				remamente = (totalFact - ((otro_subtot + otro_iva) + (subtot + iva))).toFixed(2);
				if(remamente<0)
				{
					document.getElementById('tipo'+tipoGasto+'_fact'+i+'_remamente').value = 0;
					actualizaKW('posicion', tipoGasto, handle, 'remamente', 0);
				}
				else
				{
					document.getElementById('tipo'+tipoGasto+'_fact'+i+'_remamente').value = dosDecim(remamente);
					actualizaKW('posicion', tipoGasto, handle, 'remamente', dosDecim(remamente));
					subtotNoDed = (parseFloat(subtotNoDed) + parseFloat(remamente)).toFixed(2);
				}

				servicio = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_servicio').value);
				if(servicio>0)
				{
					subtotNoDed = (parseFloat(subtotNoDed) + parseFloat(servicio)).toFixed(2);
				}

				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ded').value = dosDecim(subtotDed);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaAcre').value = dosDecim(ivaAcred);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_noded').value = dosDecim(subtotNoDed);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaNoAcre').value = dosDecim(ivaNoAcred);
				actualizaKW('posicion', tipoGasto, handle, 'ded', dosDecim(subtotDed));
				actualizaKW('posicion', tipoGasto, handle, 'ivaAcre', dosDecim(ivaAcred));
				actualizaKW('posicion', tipoGasto, handle, 'noDed', dosDecim(subtotNoDed));
				actualizaKW('posicion', tipoGasto, handle, 'ivaNoAcre', dosDecim(ivaNoAcred));
				actualizaKW('posicion', tipoGasto, handle, 'impLoc', 0);
			}
			var sumDed = 0.0;
			var sumNoDed = 0.0;
			var sumIVA = 0.0;
			var sumNoIVA = 0.0;
			var sumServ = 0.0;
			var sumPersonas = 0;
			var sumComidas = 0.0;
			var sumReman = 0;
			for(var n = 1; n<= countFact; n++)
			{
				var ded = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ded').value;
				if (ded=='') ded = 0;
				sumDed = ((parseFloat(sumDed) + parseFloat(ded))).toFixed(2);
				var NoDed = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_noded').value;
				if (NoDed=='') NoDed = 0;
				sumNoDed = ((parseFloat(sumNoDed) + parseFloat(NoDed))).toFixed(2);
				var iva = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ivaAcre').value;
				if (iva=='') iva = 0;
				sumIVA = ((parseFloat(sumIVA) + parseFloat(iva))).toFixed(2);
				var noIVA = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ivaNoAcre').value;
				if (noIVA=='') noIVA = 0;
				sumNoIVA = ((parseFloat(sumNoIVA) + parseFloat(noIVA))).toFixed(2);
				var serv = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_servicio').value;
				if (serv=='') serv = 0;
				sumServ = ((parseFloat(sumServ) + parseFloat(serv))).toFixed(2);
				var personas = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_personas').value;
				if (personas=='') personas = 0;
				sumPersonas = ((parseFloat(sumPersonas) + parseInt(personas))).toFixed(2);
				var comidas = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_comidas').value;
				if (comidas=='') comidas = 0;
				sumComidas = ((parseFloat(sumComidas) + parseInt(comidas))).toFixed(2);
				var remamente = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_remamente').value;
				if (remamente=='') remamente = 0;
				sumReman = ((parseFloat(sumReman) + parseFloat(remamente))).toFixed(2);
			}
			document.getElementById('sum_tipo'+tipoGasto+'_serv').value = dosDecim(sumServ);
			document.getElementById('sum_tipo'+tipoGasto+'_personas').value = dosDecim(sumPersonas);
			document.getElementById('sum_tipo'+tipoGasto+'_comidas').value = dosDecim(sumComidas);
				
			document.getElementById('mto_tipo'+tipoGasto+'_ded').innerHTML = dosDecim(sumDed);
			document.getElementById('mto_tipo'+tipoGasto+'_noded').innerHTML = dosDecim(sumNoDed);
			document.getElementById('mto_tipo'+tipoGasto+'_iva').innerHTML = dosDecim(sumIVA);
			document.getElementById('mto_tipo'+tipoGasto+'_noiva').innerHTML = dosDecim(sumNoIVA);

			var concatDet = sumPersonas + '-' + sumComidas;

			actualizaKW('sumas', tipoGasto, '', 'ded', dosDecim(sumDed));
			actualizaKW('sumas', tipoGasto, '', 'noDed', dosDecim(sumNoDed));
			actualizaKW('sumas', tipoGasto, '', 'ivaAcre', dosDecim(sumIVA));
			actualizaKW('sumas', tipoGasto, '', 'ivaNoAcre', dosDecim(sumNoIVA));
			actualizaKW('sumas', tipoGasto, '', 'serv', dosDecim(sumServ));
			actualizaKW('sumas', tipoGasto, '', 'detGast', dosDecim(concatDet));

			sumTotDed = (parseFloat(sumTotDed) + parseFloat(sumDed)).toFixed(2);
			sumTotNoDed = (parseFloat(sumTotNoDed) + parseFloat(sumNoDed)).toFixed(2);
			sumTotIVAAcre = (parseFloat(sumTotIVAAcre) + parseFloat(sumIVA)).toFixed(2);
			sumTotIVAnoAcre = (parseFloat(sumTotIVAnoAcre) + parseFloat(sumNoIVA)).toFixed(2);
			sumTotComp = (parseFloat(sumTotComp) + parseFloat(sumDed) + parseFloat(sumNoDed) + parseFloat(sumIVA) + parseFloat(sumNoIVA)).toFixed(2);
		break;
		case 4:
			for(var i = 1; i<= countFact; i++)
			{
				handle = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_handle').value;
				tipoFact = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_tipoFact').value;
				totalFact = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_totFact').value);
				subtot = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_subtotFact').value);
				iva = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaFact').value);
				tipoPago = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_tPago').value;
				cantItems = parseInt(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_cantItems').value, 10);
				desgloce = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_desgloce').value;
				var desgloces = desgloce.split('-');
				var otro_subtot = 0;
				var otro_iva = 0;
				if(desgloce!='')
				{
					subtot = 0;
					iva = 0;
					for(r=1;r<=250;r++)
					{
						handleItem = document.getElementById('OBKey__572_'+r).value;
						if(handleItem!='')
						{
							if(handleItem==handle)
							{
								tGastoItem = document.getElementById('OBKey__620_'+r).value;

								if(tipoGasto==tGastoItem)
								{
									subtot = subtot + parseFloat(document.getElementById('OBKey__195_'+r).value);
									tmp_iva = document.getElementById('OBKey__504_'+r).value;
									if(tmp_iva!='')
									{
										iva = iva + parseFloat(tmp_iva);
									}
								}
								else
								{
									otro_subtot = otro_subtot + parseFloat(document.getElementById('OBKey__195_'+r).value);
									otrotmp_iva = document.getElementById('OBKey__504_'+r).value;
									if(otrotmp_iva!='')
									{
										otro_iva = otro_iva + parseFloat(otrotmp_iva);
									}
								}

							}
						}
						else
						{
							break;
						}
					}
				}
				var subtotDed = 0;
				var subtotNoDed = 0;
				var ivaAcred = 0;
				var ivaNoAcred = 0;
				var unidadPorcentaje = 0;
				if((tipoFact == 'IMG') || (tipoFact == 'SCOMP'))
				{
					subtotDed = 0;
					subtotNoDed = subtot;
					ivaAcred = 0;
					ivaNoAcred = iva;
				}
				else
				{
					if(tipoPago=='1')
					{
						if(totalFact<=topeFisEfectivo)
						{
							if(pol_tFiscExt)	
							{
								if(pol_unidadFis=='PESOS')
								{
									if(subtot>pol_TopeFiscExt)
									{
										subtotDed = pol_TopeFiscExt;
										subtotNoDed = subtot - pol_TopeFiscExt;
										ivaAcred = pol_TopeFiscExt * valorIva;
										ivaNoAcred = iva - ivaAcred;
									}
									else
									{
										subtotDed = subtot;
										subtotNoDed = 0;
										ivaAcred = iva;
										ivaNoAcred = 0;
									}
								}
								if(pol_unidadFis=='%')
								{
									subtotDed = subtot * pol_TopeFiscExt;
									subtotNoDed = subtot - subtotDed;
									ivaAcred = iva * pol_TopeFiscExt;
									ivaNoAcred = iva - ivaAcred;
								}
							}
							else if(pol_tFiscNac)
							{
								if(pol_unidadFis=='PESOS')
								{
									if(subtot>pol_TopeFiscNac)
									{
										subtotDed = pol_TopeFiscNac;
										subtotNoDed = subtot - pol_TopeFiscNac;
										ivaAcred = pol_TopeFiscNac * valorIva;
										ivaNoAcred = iva - ivaAcred;
									}
									else
									{
										subtotDed = subtot;
										subtotNoDed = 0;
										ivaAcred = iva;
										ivaNoAcred = 0;
									}
									
								}
								if(pol_unidadFis=='%')
								{
									subtotDed = subtot * pol_TopeFiscNac;
									subtotNoDed = subtot - subtotDed;
									ivaAcred = iva * pol_TopeFiscNac;
									ivaNoAcred = iva - ivaAcred;
								}
							}
							else
							{
								subtotDed = subtot;
								subtotNoDed = 0;
								ivaAcred = iva;
								ivaNoAcred = 0;
							}
						}
						else
						{
							subtotDed = 0;
							subtotNoDed = subtot;
							ivaAcred = 0;
							ivaNoAcred = iva;
						}
					}
					else
					{
						if(pol_tFiscExt)	
						{
							if(pol_unidadFis=='PESOS')
							{
								if(subtot>pol_TopeFiscExt)
								{
									subtotDed = pol_TopeFiscExt;
									subtotNoDed = subtot - pol_TopeFiscExt;
									ivaAcred = pol_TopeFiscExt * valorIva;
									ivaNoAcred = iva - ivaAcred;
								}
								else
								{
									subtotDed = subtot;
									subtotNoDed = 0;
									ivaAcred = iva;
									ivaNoAcred = 0;
								}
							}
							if(pol_unidadFis=='%')
							{
								subtotDed = subtot * pol_TopeFiscExt;
								subtotNoDed = subtot - subtotDed;
								ivaAcred = iva * pol_TopeFiscExt;
								ivaNoAcred = iva - ivaAcred;
							}
						}
						else if(pol_tFiscNac)
						{
							if(pol_unidadFis=='PESOS')
							{
								if(subtot>pol_TopeFiscNac)
								{
									subtotDed = pol_TopeFiscNac;
									subtotNoDed = subtot - pol_TopeFiscNac;
									ivaAcred = pol_TopeFiscNac * valorIva;
									ivaNoAcred = iva - ivaAcred;
								}
								else
								{
									subtotDed = subtot;
									subtotNoDed = 0;
									ivaAcred = iva;
									ivaNoAcred = 0;
								}
								
							}
							if(pol_unidadFis=='%')
							{
								subtotDed = subtot * pol_TopeFiscNac;
								subtotNoDed = subtot - subtotDed;
								ivaAcred = iva * pol_TopeFiscNac;
								ivaNoAcred = iva - ivaAcred;
							}
						}
						else
						{
							subtotDed = subtot;
							subtotNoDed = 0;
							ivaAcred = iva;
							ivaNoAcred = 0;
						}
					}
				}
				
				//alert('Rubro='+ tipoG +'\n pol_tFiscNac=' + pol_tFiscNac + '\n pol_tFiscExt=' + pol_tFiscExt + '\n pol_unidadFis=' + pol_unidadFis + '\n valorIva=' + valorIva + '\n subtot=' + subtot + '\n iva=' + iva  + '\n pol_TopeFiscNac=' + pol_TopeFiscNac + '\n subtotDed=' + subtotDed + '\n subtotNoDed=' + subtotNoDed + '\n ivaAcred=' + ivaAcred + '\n ivaNoAcred=' + ivaNoAcred);

				remamente = (totalFact - ((otro_subtot + otro_iva) + (subtot + iva))).toFixed(2);
				if(remamente<0)
				{
					document.getElementById('tipo'+tipoGasto+'_fact'+i+'_remamente').value = 0;
					actualizaKW('posicion', tipoGasto, handle, 'remamente', 0);
				}
				else
				{
					document.getElementById('tipo'+tipoGasto+'_fact'+i+'_remamente').value = dosDecim(remamente);
					actualizaKW('posicion', tipoGasto, handle, 'remamente', dosDecim(remamente));
					subtotNoDed = (parseFloat(subtotNoDed) + parseFloat(remamente)).toFixed(2);
				}

				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ded').value = dosDecim(subtotDed);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaAcre').value = dosDecim(ivaAcred);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_noded').value = dosDecim(subtotNoDed);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaNoAcre').value = dosDecim(ivaNoAcred);
				actualizaKW('posicion', tipoGasto, handle, 'ded', dosDecim(subtotDed));
				actualizaKW('posicion', tipoGasto, handle, 'ivaAcre', dosDecim(ivaAcred));
				actualizaKW('posicion', tipoGasto, handle, 'noDed', dosDecim(subtotNoDed));
				actualizaKW('posicion', tipoGasto, handle, 'ivaNoAcre', dosDecim(ivaNoAcred));
				actualizaKW('posicion', tipoGasto, handle, 'impLoc', 0);
			}
			var sumDed = 0.0;
			var sumNoDed = 0.0;
			var sumIVA = 0.0;
			var sumNoIVA = 0.0;
			var sumKms = 0.0;
			var sumReman = 0;
			for(var n = 1; n<= countFact; n++)
			{
				var ded = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ded').value;
				if (ded=='') ded = 0;
				sumDed = ((parseFloat(sumDed) + parseFloat(ded))).toFixed(2);
				var NoDed = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_noded').value;
				if (NoDed=='') NoDed = 0;
				sumNoDed = ((parseFloat(sumNoDed) + parseFloat(NoDed))).toFixed(2);
				var iva = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ivaAcre').value;
				if (iva=='') iva = 0;
				sumIVA = ((parseFloat(sumIVA) + parseFloat(iva))).toFixed(2);
				var noIVA = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ivaNoAcre').value;
				if (noIVA=='') noIVA = 0;
				sumNoIVA = ((parseFloat(sumNoIVA) + parseFloat(noIVA))).toFixed(2);
				var kms = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_kms').value;
				if (kms=='') kms = 0;
				sumKms = ((parseFloat(sumKms) + parseFloat(kms))).toFixed(2);
				var remamente = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_remamente').value;
				if (remamente=='') remamente = 0;
				sumReman = ((parseFloat(sumReman) + parseFloat(remamente))).toFixed(2);
			}
			document.getElementById('sum_tipo'+tipoGasto+'_kms').value = dosDecim(sumKms);
			
			document.getElementById('mto_tipo'+tipoGasto+'_ded').innerHTML = dosDecim(sumDed);
			document.getElementById('mto_tipo'+tipoGasto+'_noded').innerHTML = dosDecim(sumNoDed);
			document.getElementById('mto_tipo'+tipoGasto+'_iva').innerHTML = dosDecim(sumIVA);
			document.getElementById('mto_tipo'+tipoGasto+'_noiva').innerHTML = dosDecim(sumNoIVA);

			actualizaKW('sumas', tipoGasto, '', 'ded', dosDecim(sumDed));
			actualizaKW('sumas', tipoGasto, '', 'noDed', dosDecim(sumNoDed));
			actualizaKW('sumas', tipoGasto, '', 'ivaAcre', dosDecim(sumIVA));
			actualizaKW('sumas', tipoGasto, '', 'ivaNoAcre', dosDecim(sumNoIVA));
			actualizaKW('sumas', tipoGasto, '', 'detGast', dosDecim(sumKms));

			sumTotDed = (parseFloat(sumTotDed) + parseFloat(sumDed)).toFixed(2);
			sumTotNoDed = (parseFloat(sumTotNoDed) + parseFloat(sumNoDed)).toFixed(2);
			sumTotIVAAcre = (parseFloat(sumTotIVAAcre) + parseFloat(sumIVA)).toFixed(2);
			sumTotIVAnoAcre = (parseFloat(sumTotIVAnoAcre) + parseFloat(sumNoIVA)).toFixed(2);
			sumTotComp = (parseFloat(sumTotComp) + parseFloat(sumDed) + parseFloat(sumNoDed) + parseFloat(sumIVA) + parseFloat(sumNoIVA)).toFixed(2);
		break;
		case 5:
			for(var i = 1; i<= countFact; i++)
			{
				handle = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_handle').value;
				tipoFact = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_tipoFact').value;
				totalFact = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_totFact').value);
				subtot = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_subtotFact').value);
				iva = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaFact').value);
				tipoPago = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_tPago').value;
				cantItems = parseInt(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_cantItems').value, 10);
				desgloce = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_desgloce').value;
				var desgloces = desgloce.split('-');
				var otro_subtot = 0;
				var otro_iva = 0;
				if(desgloce!='')
				{
					subtot = 0;
					iva = 0;
					for(r=1;r<=250;r++)
					{
						handleItem = document.getElementById('OBKey__572_'+r).value;
						if(handleItem!='')
						{
							if(handleItem==handle)
							{
								tGastoItem = document.getElementById('OBKey__620_'+r).value;

								if(tipoGasto==tGastoItem)
								{
									subtot = subtot + parseFloat(document.getElementById('OBKey__195_'+r).value);
									tmp_iva = document.getElementById('OBKey__504_'+r).value;
									if(tmp_iva!='')
									{
										iva = iva + parseFloat(tmp_iva);
									}
								}
								else
								{
									otro_subtot = otro_subtot + parseFloat(document.getElementById('OBKey__195_'+r).value);
									otrotmp_iva = document.getElementById('OBKey__504_'+r).value;
									if(otrotmp_iva!='')
									{
										otro_iva = otro_iva + parseFloat(otrotmp_iva);
									}
								}

							}
						}
						else
						{
							break;
						}
					}
				}
				var subtotDed = 0;
				var subtotNoDed = 0;
				var ivaAcred = 0;
				var ivaNoAcred = 0;
				var unidadPorcentaje = 0;
				if((tipoFact == 'IMG') || (tipoFact == 'SCOMP'))
				{
					subtotDed = 0;
					subtotNoDed = subtot;
					ivaAcred = 0;
					ivaNoAcred = iva;
				}
				else
				{
					if(tipoPago=='1')
					{
						if(totalFact<=topeFisEfectivo)
						{
							if(pol_tFiscExt)	
							{
								if(pol_unidadFis=='PESOS')
								{
									if(subtot>pol_TopeFiscExt)
									{
										subtotDed = pol_TopeFiscExt;
										subtotNoDed = subtot - pol_TopeFiscExt;
										ivaAcred = pol_TopeFiscExt * valorIva;
										ivaNoAcred = iva - ivaAcred;
									}
									else
									{
										subtotDed = subtot;
										subtotNoDed = 0;
										ivaAcred = iva;
										ivaNoAcred = 0;
									}
								}
								if(pol_unidadFis=='%')
								{
									subtotDed = subtot * pol_TopeFiscExt;
									subtotNoDed = subtot - subtotDed;
									ivaAcred = iva * pol_TopeFiscExt;
									ivaNoAcred = iva - ivaAcred;
								}
							}
							else if(pol_tFiscNac)
							{
								if(pol_unidadFis=='PESOS')
								{
									if(subtot>pol_TopeFiscNac)
									{
										subtotDed = pol_TopeFiscNac;
										subtotNoDed = subtot - pol_TopeFiscNac;
										ivaAcred = pol_TopeFiscNac * valorIva;
										ivaNoAcred = iva - ivaAcred;
									}
									else
									{
										subtotDed = subtot;
										subtotNoDed = 0;
										ivaAcred = iva;
										ivaNoAcred = 0;
									}
									
								}
								if(pol_unidadFis=='%')
								{
									subtotDed = subtot * pol_TopeFiscNac;
									subtotNoDed = subtot - subtotDed;
									ivaAcred = iva * pol_TopeFiscNac;
									ivaNoAcred = iva - ivaAcred;
								}
							}
							else
							{
								subtotDed = subtot;
								subtotNoDed = 0;
								ivaAcred = iva;
								ivaNoAcred = 0;
							}
						}
						else
						{
							subtotDed = 0;
							subtotNoDed = subtot;
							ivaAcred = 0;
							ivaNoAcred = iva;
						}
					}
					else
					{
						if(pol_tFiscExt)	
						{
							if(pol_unidadFis=='PESOS')
							{
								if(subtot>pol_TopeFiscExt)
								{
									subtotDed = pol_TopeFiscExt;
									subtotNoDed = subtot - pol_TopeFiscExt;
									ivaAcred = pol_TopeFiscExt * valorIva;
									ivaNoAcred = iva - ivaAcred;
								}
								else
								{
									subtotDed = subtot;
									subtotNoDed = 0;
									ivaAcred = iva;
									ivaNoAcred = 0;
								}
							}
							if(pol_unidadFis=='%')
							{
								subtotDed = subtot * pol_TopeFiscExt;
								subtotNoDed = subtot - subtotDed;
								ivaAcred = iva * pol_TopeFiscExt;
								ivaNoAcred = iva - ivaAcred;
							}
						}
						else if(pol_tFiscNac)
						{
							if(pol_unidadFis=='PESOS')
							{
								if(subtot>pol_TopeFiscNac)
								{
									subtotDed = pol_TopeFiscNac;
									subtotNoDed = subtot - pol_TopeFiscNac;
									ivaAcred = pol_TopeFiscNac * valorIva;
									ivaNoAcred = iva - ivaAcred;
								}
								else
								{
									subtotDed = subtot;
									subtotNoDed = 0;
									ivaAcred = iva;
									ivaNoAcred = 0;
								}
								
							}
							if(pol_unidadFis=='%')
							{
								subtotDed = subtot * pol_TopeFiscNac;
								subtotNoDed = subtot - subtotDed;
								ivaAcred = iva * pol_TopeFiscNac;
								ivaNoAcred = iva - ivaAcred;
							}
						}
						else
						{
							subtotDed = subtot;
							subtotNoDed = 0;
							ivaAcred = iva;
							ivaNoAcred = 0;
						}
					}
				}
				
				//alert('Rubro='+ tipoG +'\n pol_tFiscNac=' + pol_tFiscNac + '\n pol_tFiscExt=' + pol_tFiscExt + '\n pol_unidadFis=' + pol_unidadFis + '\n valorIva=' + valorIva + '\n subtot=' + subtot + '\n iva=' + iva  + '\n pol_TopeFiscNac=' + pol_TopeFiscNac + '\n subtotDed=' + subtotDed + '\n subtotNoDed=' + subtotNoDed + '\n ivaAcred=' + ivaAcred + '\n ivaNoAcred=' + ivaNoAcred);

				remamente = (totalFact - ((otro_subtot + otro_iva) + (subtot + iva))).toFixed(2);
				if(remamente<0)
				{
					document.getElementById('tipo'+tipoGasto+'_fact'+i+'_remamente').value = 0;
					actualizaKW('posicion', tipoGasto, handle, 'remamente', 0);
				}
				else
				{
					document.getElementById('tipo'+tipoGasto+'_fact'+i+'_remamente').value = dosDecim(remamente);
					actualizaKW('posicion', tipoGasto, handle, 'remamente', dosDecim(remamente));
					subtotNoDed = (parseFloat(subtotNoDed) + parseFloat(remamente)).toFixed(2);
				}

				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ded').value = dosDecim(subtotDed);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaAcre').value = dosDecim(ivaAcred);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_noded').value = dosDecim(subtotNoDed);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaNoAcre').value = dosDecim(ivaNoAcred);
				actualizaKW('posicion', tipoGasto, handle, 'ded', dosDecim(subtotDed));
				actualizaKW('posicion', tipoGasto, handle, 'ivaAcre', dosDecim(ivaAcred));
				actualizaKW('posicion', tipoGasto, handle, 'noDed', dosDecim(subtotNoDed));
				actualizaKW('posicion', tipoGasto, handle, 'ivaNoAcre', dosDecim(ivaNoAcred));
				actualizaKW('posicion', tipoGasto, handle, 'impLoc', 0);
			}
			var sumDed = 0.0;
			var sumNoDed = 0.0;
			var sumIVA = 0.0;
			var sumNoIVA = 0.0;
			var sumViajes = 0;
			var sumReman = 0;
			for(var n = 1; n<= countFact; n++)
			{
				var ded = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ded').value;
				if (ded=='') ded = 0;
				sumDed = ((parseFloat(sumDed) + parseFloat(ded))).toFixed(2);
				var NoDed = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_noded').value;
				if (NoDed=='') NoDed = 0;
				sumNoDed = ((parseFloat(sumNoDed) + parseFloat(NoDed))).toFixed(2);
				var iva = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ivaAcre').value;
				if (iva=='') iva = 0;
				sumIVA = ((parseFloat(sumIVA) + parseFloat(iva))).toFixed(2);
				var noIVA = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ivaNoAcre').value;
				if (noIVA=='') noIVA = 0;
				sumNoIVA = ((parseFloat(sumNoIVA) + parseFloat(noIVA))).toFixed(2);
				var viajes = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_viajes').value;
				if (viajes=='') viajes = 0;
				sumViajes = ((parseFloat(sumViajes) + parseFloat(viajes))).toFixed(2);
				var remamente = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_remamente').value;
				if (remamente=='') remamente = 0;
				sumReman = ((parseFloat(sumReman) + parseFloat(remamente))).toFixed(2);
			}
			document.getElementById('sum_tipo'+tipoGasto+'_viajes').value = dosDecim(sumViajes);
			
			document.getElementById('mto_tipo'+tipoGasto+'_ded').innerHTML = dosDecim(sumDed);
			document.getElementById('mto_tipo'+tipoGasto+'_noded').innerHTML = dosDecim(sumNoDed);
			document.getElementById('mto_tipo'+tipoGasto+'_iva').innerHTML = dosDecim(sumIVA);
			document.getElementById('mto_tipo'+tipoGasto+'_noiva').innerHTML = dosDecim(sumNoIVA);

			actualizaKW('sumas', tipoGasto, '', 'ded', dosDecim(sumDed));
			actualizaKW('sumas', tipoGasto, '', 'noDed', dosDecim(sumNoDed));
			actualizaKW('sumas', tipoGasto, '', 'ivaAcre', dosDecim(sumIVA));
			actualizaKW('sumas', tipoGasto, '', 'ivaNoAcre', dosDecim(sumNoIVA));

			sumTotDed = (parseFloat(sumTotDed) + parseFloat(sumDed)).toFixed(2);
			sumTotNoDed = (parseFloat(sumTotNoDed) + parseFloat(sumNoDed)).toFixed(2);
			sumTotIVAAcre = (parseFloat(sumTotIVAAcre) + parseFloat(sumIVA)).toFixed(2);
			sumTotIVAnoAcre = (parseFloat(sumTotIVAnoAcre) + parseFloat(sumNoIVA)).toFixed(2);
			sumTotComp = (parseFloat(sumTotComp) + parseFloat(sumDed) + parseFloat(sumNoDed) + parseFloat(sumIVA) + parseFloat(sumNoIVA)).toFixed(2);
		break;
		case 6:
			for(var i = 1; i<= countFact; i++)
			{
				handle = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_handle').value;
				tipoFact = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_tipoFact').value;
				totalFact = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_totFact').value);
				subtot = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_subtotFact').value);
				iva = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaFact').value);
				tipoPago = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_tPago').value;
				cantItems = parseInt(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_cantItems').value, 10);
				desgloce = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_desgloce').value;
				var desgloces = desgloce.split('-');
				var otro_subtot = 0;
				var otro_iva = 0;
				if(desgloce!='')
				{
					subtot = 0;
					iva = 0;
					for(r=1;r<=250;r++)
					{
						handleItem = document.getElementById('OBKey__572_'+r).value;
						if(handleItem!='')
						{
							if(handleItem==handle)
							{
								tGastoItem = document.getElementById('OBKey__620_'+r).value;

								if(tipoGasto==tGastoItem)
								{
									subtot = subtot + parseFloat(document.getElementById('OBKey__195_'+r).value);
									tmp_iva = document.getElementById('OBKey__504_'+r).value;
									if(tmp_iva!='')
									{
										iva = iva + parseFloat(tmp_iva);
									}
								}
								else
								{
									otro_subtot = otro_subtot + parseFloat(document.getElementById('OBKey__195_'+r).value);
									otrotmp_iva = document.getElementById('OBKey__504_'+r).value;
									if(otrotmp_iva!='')
									{
										otro_iva = otro_iva + parseFloat(otrotmp_iva);
									}
								}

							}
						}
						else
						{
							break;
						}
					}
				}
				var subtotDed = 0;
				var subtotNoDed = 0;
				var ivaAcred = 0;
				var ivaNoAcred = 0;
				var unidadPorcentaje = 0;
				if((tipoFact == 'IMG') || (tipoFact == 'SCOMP'))
				{
					subtotDed = 0;
					subtotNoDed = subtot;
					ivaAcred = 0;
					ivaNoAcred = iva;
				}
				else
				{
					if(tipoPago=='1')
					{
						if(totalFact<=topeFisEfectivo)
						{
							if(pol_tFiscExt)	
							{
								if(pol_unidadFis=='PESOS')
								{
									if(subtot>pol_TopeFiscExt)
									{
										subtotDed = pol_TopeFiscExt;
										subtotNoDed = subtot - pol_TopeFiscExt;
										ivaAcred = pol_TopeFiscExt * valorIva;
										ivaNoAcred = iva - ivaAcred;
									}
									else
									{
										subtotDed = subtot;
										subtotNoDed = 0;
										ivaAcred = iva;
										ivaNoAcred = 0;
									}
								}
								if(pol_unidadFis=='%')
								{
									subtotDed = subtot * pol_TopeFiscExt;
									subtotNoDed = subtot - subtotDed;
									ivaAcred = iva * pol_TopeFiscExt;
									ivaNoAcred = iva - ivaAcred;
								}
							}
							else if(pol_tFiscNac)
							{
								if(pol_unidadFis=='PESOS')
								{
									if(subtot>pol_TopeFiscNac)
									{
										subtotDed = pol_TopeFiscNac;
										subtotNoDed = subtot - pol_TopeFiscNac;
										ivaAcred = pol_TopeFiscNac * valorIva;
										ivaNoAcred = iva - ivaAcred;
									}
									else
									{
										subtotDed = subtot;
										subtotNoDed = 0;
										ivaAcred = iva;
										ivaNoAcred = 0;
									}
									
								}
								if(pol_unidadFis=='%')
								{
									subtotDed = subtot * pol_TopeFiscNac;
									subtotNoDed = subtot - subtotDed;
									ivaAcred = iva * pol_TopeFiscNac;
									ivaNoAcred = iva - ivaAcred;
								}
							}
							else
							{
								subtotDed = subtot;
								subtotNoDed = 0;
								ivaAcred = iva;
								ivaNoAcred = 0;
							}
						}
						else
						{
							subtotDed = 0;
							subtotNoDed = subtot;
							ivaAcred = 0;
							ivaNoAcred = iva;
						}
					}
					else
					{
						if(pol_tFiscExt)	
						{
							if(pol_unidadFis=='PESOS')
							{
								if(subtot>pol_TopeFiscExt)
								{
									subtotDed = pol_TopeFiscExt;
									subtotNoDed = subtot - pol_TopeFiscExt;
									ivaAcred = pol_TopeFiscExt * valorIva;
									ivaNoAcred = iva - ivaAcred;
								}
								else
								{
									subtotDed = subtot;
									subtotNoDed = 0;
									ivaAcred = iva;
									ivaNoAcred = 0;
								}
							}
							if(pol_unidadFis=='%')
							{
								subtotDed = subtot * pol_TopeFiscExt;
								subtotNoDed = subtot - subtotDed;
								ivaAcred = iva * pol_TopeFiscExt;
								ivaNoAcred = iva - ivaAcred;
							}
						}
						else if(pol_tFiscNac)
						{
							if(pol_unidadFis=='PESOS')
							{
								if(subtot>pol_TopeFiscNac)
								{
									subtotDed = pol_TopeFiscNac;
									subtotNoDed = subtot - pol_TopeFiscNac;
									ivaAcred = pol_TopeFiscNac * valorIva;
									ivaNoAcred = iva - ivaAcred;
								}
								else
								{
									subtotDed = subtot;
									subtotNoDed = 0;
									ivaAcred = iva;
									ivaNoAcred = 0;
								}
								
							}
							if(pol_unidadFis=='%')
							{
								subtotDed = subtot * pol_TopeFiscNac;
								subtotNoDed = subtot - subtotDed;
								ivaAcred = iva * pol_TopeFiscNac;
								ivaNoAcred = iva - ivaAcred;
							}
						}
						else
						{
							subtotDed = subtot;
							subtotNoDed = 0;
							ivaAcred = iva;
							ivaNoAcred = 0;
						}
					}
				}
				
				//alert('Rubro='+ tipoG +'\n pol_tFiscNac=' + pol_tFiscNac + '\n pol_tFiscExt=' + pol_tFiscExt + '\n pol_unidadFis=' + pol_unidadFis + '\n valorIva=' + valorIva + '\n subtot=' + subtot + '\n iva=' + iva  + '\n pol_TopeFiscNac=' + pol_TopeFiscNac + '\n subtotDed=' + subtotDed + '\n subtotNoDed=' + subtotNoDed + '\n ivaAcred=' + ivaAcred + '\n ivaNoAcred=' + ivaNoAcred);

				remamente = (totalFact - ((otro_subtot + otro_iva) + (subtot + iva))).toFixed(2);
				if(remamente<0)
				{
					document.getElementById('tipo'+tipoGasto+'_fact'+i+'_remamente').value = 0;
					actualizaKW('posicion', tipoGasto, handle, 'remamente', 0);
				}
				else
				{
					document.getElementById('tipo'+tipoGasto+'_fact'+i+'_remamente').value = dosDecim(remamente);
					actualizaKW('posicion', tipoGasto, handle, 'remamente', dosDecim(remamente));
					subtotNoDed = (parseFloat(subtotNoDed) + parseFloat(remamente)).toFixed(2);
				}

				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ded').value = dosDecim(subtotDed);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaAcre').value = dosDecim(ivaAcred);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_noded').value = dosDecim(subtotNoDed);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaNoAcre').value = dosDecim(ivaNoAcred);
				actualizaKW('posicion', tipoGasto, handle, 'ded', dosDecim(subtotDed));
				actualizaKW('posicion', tipoGasto, handle, 'ivaAcre', dosDecim(ivaAcred));
				actualizaKW('posicion', tipoGasto, handle, 'noDed', dosDecim(subtotNoDed));
				actualizaKW('posicion', tipoGasto, handle, 'ivaNoAcre', dosDecim(ivaNoAcred));
				actualizaKW('posicion', tipoGasto, handle, 'impLoc', 0);
			}
			var sumDed = 0.0;
			var sumNoDed = 0.0;
			var sumIVA = 0.0;
			var sumNoIVA = 0.0;
			var sumReman = 0;
			for(var n = 1; n<= countFact; n++)
			{
				var ded = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ded').value;
				if (ded=='') ded = 0;
				sumDed = ((parseFloat(sumDed) + parseFloat(ded))).toFixed(2);
				var NoDed = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_noded').value;
				if (NoDed=='') NoDed = 0;
				sumNoDed = ((parseFloat(sumNoDed) + parseFloat(NoDed))).toFixed(2);
				var iva = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ivaAcre').value;
				if (iva=='') iva = 0;
				sumIVA = ((parseFloat(sumIVA) + parseFloat(iva))).toFixed(2);
				var noIVA = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ivaNoAcre').value;
				if (noIVA=='') noIVA = 0;
				sumNoIVA = ((parseFloat(sumNoIVA) + parseFloat(noIVA))).toFixed(2);
				var remamente = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_remamente').value;
				if (remamente=='') remamente = 0;
				sumReman = ((parseFloat(sumReman) + parseFloat(remamente))).toFixed(2);
			}
			
			document.getElementById('mto_tipo'+tipoGasto+'_ded').innerHTML = dosDecim(sumDed);
			document.getElementById('mto_tipo'+tipoGasto+'_noded').innerHTML = dosDecim(sumNoDed);
			document.getElementById('mto_tipo'+tipoGasto+'_iva').innerHTML = dosDecim(sumIVA);
			document.getElementById('mto_tipo'+tipoGasto+'_noiva').innerHTML = dosDecim(sumNoIVA);

			actualizaKW('sumas', tipoGasto, '', 'ded', dosDecim(sumDed));
			actualizaKW('sumas', tipoGasto, '', 'noDed', dosDecim(sumNoDed));
			actualizaKW('sumas', tipoGasto, '', 'ivaAcre', dosDecim(sumIVA));
			actualizaKW('sumas', tipoGasto, '', 'ivaNoAcre', dosDecim(sumNoIVA));

			sumTotDed = (parseFloat(sumTotDed) + parseFloat(sumDed)).toFixed(2);
			sumTotNoDed = (parseFloat(sumTotNoDed) + parseFloat(sumNoDed)).toFixed(2);
			sumTotIVAAcre = (parseFloat(sumTotIVAAcre) + parseFloat(sumIVA)).toFixed(2);
			sumTotIVAnoAcre = (parseFloat(sumTotIVAnoAcre) + parseFloat(sumNoIVA)).toFixed(2);
			sumTotComp = (parseFloat(sumTotComp) + parseFloat(sumDed) + parseFloat(sumNoDed) + parseFloat(sumIVA) + parseFloat(sumNoIVA)).toFixed(2);
		break;
		case 7:
			for(var i = 1; i<= countFact; i++)
			{
				handle = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_handle').value;
				tipoFact = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_tipoFact').value;
				totalFact = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_totFact').value);
				subtot = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_subtotFact').value);
				iva = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaFact').value);
				tipoPago = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_tPago').value;
				cantItems = parseInt(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_cantItems').value, 10);
				desgloce = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_desgloce').value;
				var desgloces = desgloce.split('-');
				var otro_subtot = 0;
				var otro_iva = 0;
				if(desgloce!='')
				{
					subtot = 0;
					iva = 0;
					for(r=1;r<=250;r++)
					{
						handleItem = document.getElementById('OBKey__572_'+r).value;
						if(handleItem!='')
						{
							if(handleItem==handle)
							{
								tGastoItem = document.getElementById('OBKey__620_'+r).value;

								if(tipoGasto==tGastoItem)
								{
									subtot = subtot + parseFloat(document.getElementById('OBKey__195_'+r).value);
									tmp_iva = document.getElementById('OBKey__504_'+r).value;
									if(tmp_iva!='')
									{
										iva = iva + parseFloat(tmp_iva);
									}
								}
								else
								{
									otro_subtot = otro_subtot + parseFloat(document.getElementById('OBKey__195_'+r).value);
									otrotmp_iva = document.getElementById('OBKey__504_'+r).value;
									if(otrotmp_iva!='')
									{
										otro_iva = otro_iva + parseFloat(otrotmp_iva);
									}
								}

							}
						}
						else
						{
							break;
						}
					}
				}
				var subtotDed = 0;
				var subtotNoDed = 0;
				var ivaAcred = 0;
				var ivaNoAcred = 0;
				var unidadPorcentaje = 0;
				if((tipoFact == 'IMG') || (tipoFact == 'SCOMP'))
				{
					subtotDed = 0;
					subtotNoDed = subtot;
					ivaAcred = 0;
					ivaNoAcred = iva;
				}
				else
				{
					if(tipoPago=='1')
					{
						if(totalFact<=topeFisEfectivo)
						{
							if(pol_tFiscExt)	
							{
								if(pol_unidadFis=='PESOS')
								{
									if(subtot>pol_TopeFiscExt)
									{
										subtotDed = pol_TopeFiscExt;
										subtotNoDed = subtot - pol_TopeFiscExt;
										ivaAcred = pol_TopeFiscExt * valorIva;
										ivaNoAcred = iva - ivaAcred;
									}
									else
									{
										subtotDed = subtot;
										subtotNoDed = 0;
										ivaAcred = iva;
										ivaNoAcred = 0;
									}
								}
								if(pol_unidadFis=='%')
								{
									subtotDed = subtot * pol_TopeFiscExt;
									subtotNoDed = subtot - subtotDed;
									ivaAcred = iva * pol_TopeFiscExt;
									ivaNoAcred = iva - ivaAcred;
								}
							}
							else if(pol_tFiscNac)
							{
								if(pol_unidadFis=='PESOS')
								{
									if(subtot>pol_TopeFiscNac)
									{
										subtotDed = pol_TopeFiscNac;
										subtotNoDed = subtot - pol_TopeFiscNac;
										ivaAcred = pol_TopeFiscNac * valorIva;
										ivaNoAcred = iva - ivaAcred;
									}
									else
									{
										subtotDed = subtot;
										subtotNoDed = 0;
										ivaAcred = iva;
										ivaNoAcred = 0;
									}
									
								}
								if(pol_unidadFis=='%')
								{
									subtotDed = subtot * pol_TopeFiscNac;
									subtotNoDed = subtot - subtotDed;
									ivaAcred = iva * pol_TopeFiscNac;
									ivaNoAcred = iva - ivaAcred;
								}
							}
							else
							{
								subtotDed = subtot;
								subtotNoDed = 0;
								ivaAcred = iva;
								ivaNoAcred = 0;
							}
						}
						else
						{
							subtotDed = 0;
							subtotNoDed = subtot;
							ivaAcred = 0;
							ivaNoAcred = iva;
						}
					}
					else
					{
						if(pol_tFiscExt)	
						{
							if(pol_unidadFis=='PESOS')
							{
								if(subtot>pol_TopeFiscExt)
								{
									subtotDed = pol_TopeFiscExt;
									subtotNoDed = subtot - pol_TopeFiscExt;
									ivaAcred = pol_TopeFiscExt * valorIva;
									ivaNoAcred = iva - ivaAcred;
								}
								else
								{
									subtotDed = subtot;
									subtotNoDed = 0;
									ivaAcred = iva;
									ivaNoAcred = 0;
								}
							}
							if(pol_unidadFis=='%')
							{
								subtotDed = subtot * pol_TopeFiscExt;
								subtotNoDed = subtot - subtotDed;
								ivaAcred = iva * pol_TopeFiscExt;
								ivaNoAcred = iva - ivaAcred;
							}
						}
						else if(pol_tFiscNac)
						{
							if(pol_unidadFis=='PESOS')
							{
								if(subtot>pol_TopeFiscNac)
								{
									subtotDed = pol_TopeFiscNac;
									subtotNoDed = subtot - pol_TopeFiscNac;
									ivaAcred = pol_TopeFiscNac * valorIva;
									ivaNoAcred = iva - ivaAcred;
								}
								else
								{
									subtotDed = subtot;
									subtotNoDed = 0;
									ivaAcred = iva;
									ivaNoAcred = 0;
								}
								
							}
							if(pol_unidadFis=='%')
							{
								subtotDed = subtot * pol_TopeFiscNac;
								subtotNoDed = subtot - subtotDed;
								ivaAcred = iva * pol_TopeFiscNac;
								ivaNoAcred = iva - ivaAcred;
							}
						}
						else
						{
							subtotDed = subtot;
							subtotNoDed = 0;
							ivaAcred = iva;
							ivaNoAcred = 0;
						}
					}
				}
				
				//alert('Rubro='+ tipoG +'\n pol_tFiscNac=' + pol_tFiscNac + '\n pol_tFiscExt=' + pol_tFiscExt + '\n pol_unidadFis=' + pol_unidadFis + '\n valorIva=' + valorIva + '\n subtot=' + subtot + '\n iva=' + iva  + '\n pol_TopeFiscNac=' + pol_TopeFiscNac + '\n subtotDed=' + subtotDed + '\n subtotNoDed=' + subtotNoDed + '\n ivaAcred=' + ivaAcred + '\n ivaNoAcred=' + ivaNoAcred);

				remamente = (totalFact - ((otro_subtot + otro_iva) + (subtot + iva))).toFixed(2);
				if(remamente<0)
				{
					document.getElementById('tipo'+tipoGasto+'_fact'+i+'_remamente').value = 0;
					actualizaKW('posicion', tipoGasto, handle, 'remamente', 0);
				}
				else
				{
					document.getElementById('tipo'+tipoGasto+'_fact'+i+'_remamente').value = dosDecim(remamente);
					actualizaKW('posicion', tipoGasto, handle, 'remamente', dosDecim(remamente));
					subtotNoDed = (parseFloat(subtotNoDed) + parseFloat(remamente)).toFixed(2);
				}

				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ded').value = dosDecim(subtotDed);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaAcre').value = dosDecim(ivaAcred);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_noded').value = dosDecim(subtotNoDed);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaNoAcre').value = dosDecim(ivaNoAcred);
				actualizaKW('posicion', tipoGasto, handle, 'ded', dosDecim(subtotDed));
				actualizaKW('posicion', tipoGasto, handle, 'ivaAcre', dosDecim(ivaAcred));
				actualizaKW('posicion', tipoGasto, handle, 'noDed', dosDecim(subtotNoDed));
				actualizaKW('posicion', tipoGasto, handle, 'ivaNoAcre', dosDecim(ivaNoAcred));
				actualizaKW('posicion', tipoGasto, handle, 'impLoc', 0);
			}
			var sumDed = 0.0;
			var sumNoDed = 0.0;
			var sumIVA = 0.0;
			var sumNoIVA = 0.0;
			var sumReman = 0;
			for(var n = 1; n<= countFact; n++)
			{
				var ded = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ded').value;
				if (ded=='') ded = 0;
				sumDed = ((parseFloat(sumDed) + parseFloat(ded))).toFixed(2);
				var NoDed = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_noded').value;
				if (NoDed=='') NoDed = 0;
				sumNoDed = ((parseFloat(sumNoDed) + parseFloat(NoDed))).toFixed(2);
				var iva = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ivaAcre').value;
				if (iva=='') iva = 0;
				sumIVA = ((parseFloat(sumIVA) + parseFloat(iva))).toFixed(2);
				var noIVA = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ivaNoAcre').value;
				if (noIVA=='') noIVA = 0;
				sumNoIVA = ((parseFloat(sumNoIVA) + parseFloat(noIVA))).toFixed(2);
				var remamente = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_remamente').value;
				if (remamente=='') remamente = 0;
				sumReman = ((parseFloat(sumReman) + parseFloat(remamente))).toFixed(2);
			}
			document.getElementById('mto_tipo'+tipoGasto+'_ded').innerHTML = dosDecim(sumDed);
			document.getElementById('mto_tipo'+tipoGasto+'_noded').innerHTML = dosDecim(sumNoDed);
			document.getElementById('mto_tipo'+tipoGasto+'_iva').innerHTML = dosDecim(sumIVA);
			document.getElementById('mto_tipo'+tipoGasto+'_noiva').innerHTML = dosDecim(sumNoIVA);

			actualizaKW('sumas', tipoGasto, '', 'ded', dosDecim(sumDed));
			actualizaKW('sumas', tipoGasto, '', 'noDed', dosDecim(sumNoDed));
			actualizaKW('sumas', tipoGasto, '', 'ivaAcre', dosDecim(sumIVA));
			actualizaKW('sumas', tipoGasto, '', 'ivaNoAcre', dosDecim(sumNoIVA));

			sumTotDed = (parseFloat(sumTotDed) + parseFloat(sumDed)).toFixed(2);
			sumTotNoDed = (parseFloat(sumTotNoDed) + parseFloat(sumNoDed)).toFixed(2);
			sumTotIVAAcre = (parseFloat(sumTotIVAAcre) + parseFloat(sumIVA)).toFixed(2);
			sumTotIVAnoAcre = (parseFloat(sumTotIVAnoAcre) + parseFloat(sumNoIVA)).toFixed(2);
			sumTotComp = (parseFloat(sumTotComp) + parseFloat(sumDed) + parseFloat(sumNoDed) + parseFloat(sumIVA) + parseFloat(sumNoIVA)).toFixed(2);
		break;
		case 8:
			for(var i = 1; i<= countFact; i++)
			{
				handle = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_handle').value;
				tipoFact = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_tipoFact').value;
				totalFact = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_totFact').value);
				subtot = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_subtotFact').value);
				iva = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaFact').value);
				tipoPago = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_tPago').value;
				cantItems = parseInt(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_cantItems').value, 10);
				desgloce = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_desgloce').value;
				
				var litros = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_litros').value);
				var kms = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_kms').value);

				var desgloces = desgloce.split('-');
				var remamente = 0.0;
				var otro_subtot = 0.0;
				var otro_iva = 0.0;
				if(desgloce!='')
				{
					subtot = 0;
					iva = 0;
					for(r=1;r<=250;r++)
					{
						handleItem = document.getElementById('OBKey__572_'+r).value;
						if(handleItem!='')
						{
							if(handleItem==handle)
							{
								tGastoItem = document.getElementById('OBKey__620_'+r).value;

								if(tipoGasto==tGastoItem)
								{
									subtot = subtot + parseFloat(document.getElementById('OBKey__195_'+r).value);
									tmp_iva = document.getElementById('OBKey__504_'+r).value;
									if(tmp_iva!='')
									{
										iva = iva + parseFloat(tmp_iva);
									}
								}
								else
								{
									otro_subtot = otro_subtot + parseFloat(document.getElementById('OBKey__195_'+r).value);
									otrotmp_iva = document.getElementById('OBKey__504_'+r).value;
									if(otrotmp_iva!='')
									{
										otro_iva = otro_iva + parseFloat(otrotmp_iva);
									}
								}

							}
						}
						else
						{
							break;
						}
					}
				}
				var subtotDed = 0;
				var subtotNoDed = 0;
				var ivaAcred = 0;
				var ivaNoAcred = 0;
				var unidadPorcentaje = 0;
				if((tipoFact == 'IMG') || (tipoFact == 'SCOMP'))
				{
					subtotDed = 0;
					subtotNoDed = subtot;
					ivaAcred = 0;
					ivaNoAcred = iva;
				}
				else
				{
					if(tipoPago=='1')
					{
						if(totalFact<=topeFisEfectivo)
						{
							if(pol_tFiscExt)	
							{
								if(pol_unidadFis=='PESOS')
								{
									mtoded = kms * pol_TopeFiscExt;
									mtoiva = mtoded * valorIva;
									if(subtot>mtoded)
									{
										subtotDed = mtoded;
										subtotNoDed = subtot - subtotDed;
										if(mtoiva > iva)
										{ 
											ivaAcred = iva;
										}
										else
										{ 
											ivaAcred = mtoiva;
										}
										ivaNoAcred = iva - ivaAcred;
										if(ivaNoAcred < 0)
										{ 
											ivaNoAcred = 0
										}
									}
									else
									{
										subtotDed = subtot;
										subtotNoDed = 0;
										ivaAcred = iva;
										ivaNoAcred = 0;
									}
								}
							}
							else if(pol_tFiscNac)
							{
								if(pol_unidadFis=='PESOS')
								{
									mtoded = kms * pol_TopeFiscNac;
									mtoiva = mtoded * valorIva;
									if(subtot>mtoded)
									{
										subtotDed = mtoded;
										subtotNoDed = subtot - subtotDed;
										ivaAcred = mtoiva;
										ivaNoAcred = iva - ivaAcred;
									}
									else
									{
										subtotDed = subtot;
										subtotNoDed = 0;
										ivaAcred = iva;
										ivaNoAcred = 0;
									}
								}
							}
							else
							{
								subtotDed = subtot;
								subtotNoDed = 0;
								ivaAcred = iva;
								ivaNoAcred = 0;
							}
						}
						else
						{
							subtotDed = 0;
							subtotNoDed = subtot;
							ivaAcred = 0;
							ivaNoAcred = iva;
						}
					}
					else
					{
						if(pol_tFiscExt)	
						{   
							if(pol_unidadFis=='PESOS')
							{
								mtoded = kms * pol_TopeFiscExt;
								mtoiva = mtoded * valorIva;
								if(subtot>mtoded)
								{
									subtotDed = mtoded;
									subtotNoDed = subtot - subtotDed;
									if(mtoiva > iva)
									{ 
										ivaAcred = iva;
									}
									else
									{ 
										ivaAcred = mtoiva;
									}
									ivaNoAcred = iva - ivaAcred;
									if(ivaNoAcred < 0)
									{ 
										ivaNoAcred = 0;
									}
								}
								else
								{
									subtotDed = subtot;
									subtotNoDed = 0;
									ivaAcred = iva;
									ivaNoAcred = 0;
								}
							}
						}
						else if(pol_tFiscNac)
						{
							if(pol_unidadFis=='PESOS')
							{
								mtoded = kms * pol_TopeFiscNac;
								mtoiva = mtoded * valorIva;
								if(subtot>mtoded)
								{
									subtotDed = mtoded;
									subtotNoDed = subtot - subtotDed;
									if(mtoiva > iva)
									{ 
										ivaAcred = iva;
									}
									else
									{ 
										ivaAcred = mtoiva;
									}
									ivaNoAcred = iva - ivaAcred;
									if(ivaNoAcred < 0)
									{ 
										ivaNoAcred = 0;
									}
								}
								else
								{
									subtotDed = subtot;
									subtotNoDed = 0;
									ivaAcred = iva;
									ivaNoAcred = 0;
								}
							}
						}
						else
						{
							subtotDed = subtot;
							subtotNoDed = 0;
							ivaAcred = iva;
							ivaNoAcred = 0;
						}
					}
				}
				
				//alert('Rubro='+ tipoG +'\n pol_tFiscNac=' + pol_tFiscNac + '\n pol_tFiscExt=' + pol_tFiscExt + '\n pol_unidadFis=' + pol_unidadFis + '\n valorIva=' + valorIva + '\n subtot=' + subtot + '\n iva=' + iva  + '\n pol_TopeFiscNac=' + pol_TopeFiscNac + '\n subtotDed=' + subtotDed + '\n subtotNoDed=' + subtotNoDed + '\n ivaAcred=' + ivaAcred + '\n ivaNoAcred=' + ivaNoAcred);

				remamente = (totalFact - ((otro_subtot + otro_iva) + (subtot + iva))).toFixed(2);
				if(remamente<0)
				{
					document.getElementById('tipo'+tipoGasto+'_fact'+i+'_remamente').value = 0;
					actualizaKW('posicion', tipoGasto, handle, 'remamente', 0);
				}
				else
				{
					document.getElementById('tipo'+tipoGasto+'_fact'+i+'_remamente').value = dosDecim(remamente);
					actualizaKW('posicion', tipoGasto, handle, 'remamente', dosDecim(remamente));
					subtotNoDed = (parseFloat(subtotNoDed) + parseFloat(remamente)).toFixed(2);
				}

				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ded').value = dosDecim(subtotDed);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaAcre').value = dosDecim(ivaAcred);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_noded').value = dosDecim(subtotNoDed);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaNoAcre').value = dosDecim(ivaNoAcred);
				actualizaKW('posicion', tipoGasto, handle, 'ded', dosDecim(subtotDed));
				actualizaKW('posicion', tipoGasto, handle, 'ivaAcre', dosDecim(ivaAcred));
				actualizaKW('posicion', tipoGasto, handle, 'noDed', dosDecim(subtotNoDed));
				actualizaKW('posicion', tipoGasto, handle, 'ivaNoAcre', dosDecim(ivaNoAcred));
				actualizaKW('posicion', tipoGasto, handle, 'impLoc', 0);
			}
			var sumDed = 0.0;
			var sumNoDed = 0.0;
			var sumIVA = 0.0;
			var sumNoIVA = 0.0;
			var sumKms = 0;
			var sumLts = 0.0;
			var sumReman = 0;
			for(var n = 1; n<= countFact; n++)
			{
				var ded = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ded').value;
				if (ded=='') ded = 0;
				sumDed = ((parseFloat(sumDed) + parseFloat(ded))).toFixed(2);
				var NoDed = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_noded').value;
				if (NoDed=='') NoDed = 0;
				sumNoDed = ((parseFloat(sumNoDed) + parseFloat(NoDed))).toFixed(2);
				var iva = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ivaAcre').value;
				if (iva=='') iva = 0;
				sumIVA = ((parseFloat(sumIVA) + parseFloat(iva))).toFixed(2);
				var noIVA = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ivaNoAcre').value;
				if (noIVA=='') noIVA = 0;
				sumNoIVA = ((parseFloat(sumNoIVA) + parseFloat(noIVA))).toFixed(2);
				var km = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_kms').value;
				if (km=='') km = 0;
				sumKms = sumKms + parseInt(km);
				var lts = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_litros').value;
				if (lts=='') lts = 0;
				sumLts = sumLts + parseInt(lts);
				var remamente = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_remamente').value;
				if (remamente=='') remamente = 0;
				sumReman = ((parseFloat(sumReman) + parseFloat(remamente))).toFixed(2);
			}
			document.getElementById('sum_tipo'+tipoGasto+'_kms').value = sumKms;
			document.getElementById('sum_tipo'+tipoGasto+'_litros').value = dosDecim(sumLts);

			document.getElementById('mto_tipo'+tipoGasto+'_ded').innerHTML = dosDecim(sumDed);
			document.getElementById('mto_tipo'+tipoGasto+'_noded').innerHTML = dosDecim(sumNoDed);
			document.getElementById('mto_tipo'+tipoGasto+'_iva').innerHTML = dosDecim(sumIVA);
			document.getElementById('mto_tipo'+tipoGasto+'_noiva').innerHTML = dosDecim(sumNoIVA);

			var concatDet = sumKms + '-' + sumLts;

			actualizaKW('sumas', tipoGasto, '', 'ded', dosDecim(sumDed));
			actualizaKW('sumas', tipoGasto, '', 'noDed', dosDecim(sumNoDed));
			actualizaKW('sumas', tipoGasto, '', 'ivaAcre', dosDecim(sumIVA));
			actualizaKW('sumas', tipoGasto, '', 'ivaNoAcre', dosDecim(sumNoIVA));
			actualizaKW('sumas', tipoGasto, '', 'detGast', dosDecim(concatDet));

			sumTotDed = (parseFloat(sumTotDed) + parseFloat(sumDed)).toFixed(2);
			sumTotNoDed = (parseFloat(sumTotNoDed) + parseFloat(sumNoDed)).toFixed(2);
			sumTotIVAAcre = (parseFloat(sumTotIVAAcre) + parseFloat(sumIVA)).toFixed(2);
			sumTotIVAnoAcre = (parseFloat(sumTotIVAnoAcre) + parseFloat(sumNoIVA)).toFixed(2);
			sumTotComp = (parseFloat(sumTotComp) + parseFloat(sumDed) + parseFloat(sumNoDed) + parseFloat(sumIVA) + parseFloat(sumNoIVA)).toFixed(2);
		break;
		case 9:
			for(var i = 1; i<= countFact; i++)
			{
				handle = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_handle').value;
				tipoFact = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_tipoFact').value;
				totalFact = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_totFact').value);
				subtot = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_subtotFact').value);
				iva = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaFact').value);
				tipoPago = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_tPago').value;
				cantItems = parseInt(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_cantItems').value, 10);
				desgloce = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_desgloce').value;
				var desgloces = desgloce.split('-');
				var otro_subtot = 0;
				var otro_iva = 0;
				if(desgloce!='')
				{
					subtot = 0;
					iva = 0;
					for(r=1;r<=250;r++)
					{
						handleItem = document.getElementById('OBKey__572_'+r).value;
						if(handleItem!='')
						{
							if(handleItem==handle)
							{
								tGastoItem = document.getElementById('OBKey__620_'+r).value;

								if(tipoGasto==tGastoItem)
								{
									subtot = subtot + parseFloat(document.getElementById('OBKey__195_'+r).value);
									tmp_iva = document.getElementById('OBKey__504_'+r).value;
									if(tmp_iva!='')
									{
										iva = iva + parseFloat(tmp_iva);
									}
								}
								else
								{
									otro_subtot = otro_subtot + parseFloat(document.getElementById('OBKey__195_'+r).value);
									otrotmp_iva = document.getElementById('OBKey__504_'+r).value;
									if(otrotmp_iva!='')
									{
										otro_iva = otro_iva + parseFloat(otrotmp_iva);
									}
								}

							}
						}
						else
						{
							break;
						}
					}
				}
				var subtotDed = 0;
				var subtotNoDed = 0;
				var ivaAcred = 0;
				var ivaNoAcred = 0;
				var unidadPorcentaje = 0;
				if((tipoFact == 'IMG') || (tipoFact == 'SCOMP'))
				{
					subtotDed = 0;
					subtotNoDed = subtot;
					ivaAcred = 0;
					ivaNoAcred = iva;
				}
				else
				{
					if(tipoPago=='1')
					{
						if(totalFact<=topeFisEfectivo)
						{
							if(pol_tFiscExt)	
							{
								if(pol_unidadFis=='PESOS')
								{
									if(subtot>pol_TopeFiscExt)
									{
										subtotDed = pol_TopeFiscExt;
										subtotNoDed = subtot - pol_TopeFiscExt;
										ivaAcred = pol_TopeFiscExt * valorIva;
										ivaNoAcred = iva - ivaAcred;
									}
									else
									{
										subtotDed = subtot;
										subtotNoDed = 0;
										ivaAcred = iva;
										ivaNoAcred = 0;
									}
								}
								if(pol_unidadFis=='%')
								{
									subtotDed = subtot * pol_TopeFiscExt;
									subtotNoDed = subtot - subtotDed;
									ivaAcred = iva * pol_TopeFiscExt;
									ivaNoAcred = iva - ivaAcred;
								}
							}
							else if(pol_tFiscNac)
							{
								if(pol_unidadFis=='PESOS')
								{
									if(subtot>pol_TopeFiscNac)
									{
										subtotDed = pol_TopeFiscNac;
										subtotNoDed = subtot - pol_TopeFiscNac;
										ivaAcred = pol_TopeFiscNac * valorIva;
										ivaNoAcred = iva - ivaAcred;
									}
									else
									{
										subtotDed = subtot;
										subtotNoDed = 0;
										ivaAcred = iva;
										ivaNoAcred = 0;
									}
									
								}
								if(pol_unidadFis=='%')
								{
									subtotDed = subtot * pol_TopeFiscNac;
									subtotNoDed = subtot - subtotDed;
									ivaAcred = iva * pol_TopeFiscNac;
									ivaNoAcred = iva - ivaAcred;
								}
							}
							else
							{
								subtotDed = subtot;
								subtotNoDed = 0;
								ivaAcred = iva;
								ivaNoAcred = 0;
							}
						}
						else
						{
							subtotDed = 0;
							subtotNoDed = subtot;
							ivaAcred = 0;
							ivaNoAcred = iva;
						}
					}
					else
					{
						if(pol_tFiscExt)	
						{
							if(pol_unidadFis=='PESOS')
							{
								if(subtot>pol_TopeFiscExt)
								{
									subtotDed = pol_TopeFiscExt;
									subtotNoDed = subtot - pol_TopeFiscExt;
									ivaAcred = pol_TopeFiscExt * valorIva;
									ivaNoAcred = iva - ivaAcred;
								}
								else
								{
									subtotDed = subtot;
									subtotNoDed = 0;
									ivaAcred = iva;
									ivaNoAcred = 0;
								}
							}
							if(pol_unidadFis=='%')
							{
								subtotDed = subtot * pol_TopeFiscExt;
								subtotNoDed = subtot - subtotDed;
								ivaAcred = iva * pol_TopeFiscExt;
								ivaNoAcred = iva - ivaAcred;
							}
						}
						else if(pol_tFiscNac)
						{
							if(pol_unidadFis=='PESOS')
							{
								if(subtot>pol_TopeFiscNac)
								{
									subtotDed = pol_TopeFiscNac;
									subtotNoDed = subtot - pol_TopeFiscNac;
									ivaAcred = pol_TopeFiscNac * valorIva;
									ivaNoAcred = iva - ivaAcred;
								}
								else
								{
									subtotDed = subtot;
									subtotNoDed = 0;
									ivaAcred = iva;
									ivaNoAcred = 0;
								}
								
							}
							if(pol_unidadFis=='%')
							{
								subtotDed = subtot * pol_TopeFiscNac;
								subtotNoDed = subtot - subtotDed;
								ivaAcred = iva * pol_TopeFiscNac;
								ivaNoAcred = iva - ivaAcred;
							}
						}
						else
						{
							subtotDed = subtot;
							subtotNoDed = 0;
							ivaAcred = iva;
							ivaNoAcred = 0;
						}
					}
				}
				
				//alert('Rubro='+ tipoG +'\n pol_tFiscNac=' + pol_tFiscNac + '\n pol_tFiscExt=' + pol_tFiscExt + '\n pol_unidadFis=' + pol_unidadFis + '\n valorIva=' + valorIva + '\n subtot=' + subtot + '\n iva=' + iva  + '\n pol_TopeFiscNac=' + pol_TopeFiscNac + '\n subtotDed=' + subtotDed + '\n subtotNoDed=' + subtotNoDed + '\n ivaAcred=' + ivaAcred + '\n ivaNoAcred=' + ivaNoAcred);

				remamente = (totalFact - ((otro_subtot + otro_iva) + (subtot + iva))).toFixed(2);
				if(remamente<0)
				{
					document.getElementById('tipo'+tipoGasto+'_fact'+i+'_remamente').value = 0;
					actualizaKW('posicion', tipoGasto, handle, 'remamente', 0);
				}
				else
				{
					document.getElementById('tipo'+tipoGasto+'_fact'+i+'_remamente').value = dosDecim(remamente);
					actualizaKW('posicion', tipoGasto, handle, 'remamente', dosDecim(remamente));
					subtotNoDed = (parseFloat(subtotNoDed) + parseFloat(remamente)).toFixed(2);
				}

				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ded').value = dosDecim(subtotDed);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaAcre').value = dosDecim(ivaAcred);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_noded').value = dosDecim(subtotNoDed);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaNoAcre').value = dosDecim(ivaNoAcred);
				actualizaKW('posicion', tipoGasto, handle, 'ded', dosDecim(subtotDed));
				actualizaKW('posicion', tipoGasto, handle, 'ivaAcre', dosDecim(ivaAcred));
				actualizaKW('posicion', tipoGasto, handle, 'noDed', dosDecim(subtotNoDed));
				actualizaKW('posicion', tipoGasto, handle, 'ivaNoAcre', dosDecim(ivaNoAcred));
				actualizaKW('posicion', tipoGasto, handle, 'impLoc', 0);
			}
			var sumDed = 0.0;
			var sumNoDed = 0.0;
			var sumIVA = 0.0;
			var sumNoIVA = 0.0;
			var sumReman = 0;
			for(var n = 1; n<= countFact; n++)
			{
				var ded = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ded').value;
				if (ded=='') ded = 0;
				sumDed = ((parseFloat(sumDed) + parseFloat(ded))).toFixed(2);
				var NoDed = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_noded').value;
				if (NoDed=='') NoDed = 0;
				sumNoDed = ((parseFloat(sumNoDed) + parseFloat(NoDed))).toFixed(2);
				var iva = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ivaAcre').value;
				if (iva=='') iva = 0;
				sumIVA = ((parseFloat(sumIVA) + parseFloat(iva))).toFixed(2);
				var noIVA = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ivaNoAcre').value;
				if (noIVA=='') noIVA = 0;
				sumNoIVA = ((parseFloat(sumNoIVA) + parseFloat(noIVA))).toFixed(2);
				var remamente = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_remamente').value;
				if (remamente=='') remamente = 0;
				sumReman = ((parseFloat(sumReman) + parseFloat(remamente))).toFixed(2);
			}
			document.getElementById('mto_tipo'+tipoGasto+'_ded').innerHTML = dosDecim(sumDed);
			document.getElementById('mto_tipo'+tipoGasto+'_noded').innerHTML = dosDecim(sumNoDed);
			document.getElementById('mto_tipo'+tipoGasto+'_iva').innerHTML = dosDecim(sumIVA);
			document.getElementById('mto_tipo'+tipoGasto+'_noiva').innerHTML = dosDecim(sumNoIVA);

			actualizaKW('sumas', tipoGasto, '', 'ded', dosDecim(sumDed));
			actualizaKW('sumas', tipoGasto, '', 'noDed', dosDecim(sumNoDed));
			actualizaKW('sumas', tipoGasto, '', 'ivaAcre', dosDecim(sumIVA));
			actualizaKW('sumas', tipoGasto, '', 'ivaNoAcre', dosDecim(sumNoIVA));

			sumTotDed = (parseFloat(sumTotDed) + parseFloat(sumDed)).toFixed(2);
			sumTotNoDed = (parseFloat(sumTotNoDed) + parseFloat(sumNoDed)).toFixed(2);
			sumTotIVAAcre = (parseFloat(sumTotIVAAcre) + parseFloat(sumIVA)).toFixed(2);
			sumTotIVAnoAcre = (parseFloat(sumTotIVAnoAcre) + parseFloat(sumNoIVA)).toFixed(2);
			sumTotComp = (parseFloat(sumTotComp) + parseFloat(sumDed) + parseFloat(sumNoDed) + parseFloat(sumIVA) + parseFloat(sumNoIVA)).toFixed(2);
		break;
		case 10:
			for(var i = 1; i<= countFact; i++)
			{
				handle = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_handle').value;
				tipoFact = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_tipoFact').value;
				totalFact = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_totFact').value);
				subtot = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_subtotFact').value);
				iva = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaFact').value);
				document.getElementById('versionJS').innerHTML = 'iba = ' + iva;
				tipoPago = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_tPago').value;
				cantItems = parseInt(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_cantItems').value, 10);
				desgloce = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_desgloce').value;
				var desgloces = desgloce.split('-');
				var otro_subtot = 0;
				var otro_iva = 0;
				if(desgloce!='')
				{
					subtot = 0;
					iva = 0;
					for(r=1;r<=250;r++)
					{
						handleItem = document.getElementById('OBKey__572_'+r).value;
						if(handleItem!='')
						{
							if(handleItem==handle)
							{
								tGastoItem = document.getElementById('OBKey__620_'+r).value;

								if(tipoGasto==tGastoItem)
								{
									subtot = subtot + parseFloat(document.getElementById('OBKey__195_'+r).value);
									tmp_iva = document.getElementById('OBKey__504_'+r).value;
									if(tmp_iva!='')
									{
										iva = iva + parseFloat(tmp_iva);
									}
								}
								else
								{
									otro_subtot = otro_subtot + parseFloat(document.getElementById('OBKey__195_'+r).value);
									otrotmp_iva = document.getElementById('OBKey__504_'+r).value;
									if(otrotmp_iva!='')
									{
										otro_iva = otro_iva + parseFloat(otrotmp_iva);
									}
								}

							}
						}
						else
						{
							break;
						}
					}
				}
				var subtotDed = 0;
				var subtotNoDed = 0;
				var ivaAcred = 0;
				var ivaNoAcred = 0;
				var unidadPorcentaje = 0;
				if((tipoFact == 'IMG') || (tipoFact == 'SCOMP'))
				{
					subtotDed = 0;
					subtotNoDed = subtot;
					ivaAcred = 0;
					ivaNoAcred = iva;
				}
				else
				{
					if(tipoPago=='1')
					{
						if(totalFact<=topeFisEfectivo)
						{
							if(pol_tFiscExt)	
							{
								if(pol_unidadFis=='PESOS')
								{
									if(subtot>pol_TopeFiscExt)
									{
										subtotDed = pol_TopeFiscExt;
										subtotNoDed = subtot - pol_TopeFiscExt;
										ivaAcred = pol_TopeFiscExt * valorIva;
										ivaNoAcred = iva - ivaAcred;
									}
									else
									{
										subtotDed = subtot;
										subtotNoDed = 0;
										ivaAcred = iva;
										ivaNoAcred = 0;
									}
								}
								if(pol_unidadFis=='%')
								{
									if(iva==0)
									{
										subtotDed = subtot;
										subtotNoDed = 0;
										ivaAcred = iva;
										ivaNoAcred = 0;
									}
									else
									{
										subtotDed = subtot * pol_TopeFiscExt;
										subtotNoDed = subtot - subtotDed;
										ivaAcred = iva * pol_TopeFiscExt;
										ivaNoAcred = iva - ivaAcred;
									}
								}
							}
							else if(pol_tFiscNac)
							{
								if(pol_unidadFis=='PESOS')
								{
									if(subtot>pol_TopeFiscNac)
									{
										if(iva==0)
										{
											subtotDed = subtot;
											subtotNoDed = 0;
											ivaAcred = iva;
											ivaNoAcred = 0;
										}
										else
										{
											subtotDed = pol_TopeFiscNac;
											subtotNoDed = subtot - pol_TopeFiscNac;
											ivaAcred = pol_TopeFiscNac * valorIva;
											ivaNoAcred = iva - ivaAcred;
										}
									}
									else
									{
										subtotDed = subtot;
										subtotNoDed = 0;
										ivaAcred = iva;
										ivaNoAcred = 0;
									}
									
								}
								if(pol_unidadFis=='%')
								{
									if(iva==0)
									{
										subtotDed = subtot;
										subtotNoDed = 0;
										ivaAcred = iva;
										ivaNoAcred = 0;
									}
									else
									{
										subtotDed = subtot * pol_TopeFiscExt;
										subtotNoDed = subtot - subtotDed;
										ivaAcred = iva * pol_TopeFiscExt;
										ivaNoAcred = iva - ivaAcred;
									}
								}
							}
							else
							{
								subtotDed = subtot;
								subtotNoDed = 0;
								ivaAcred = iva;
								ivaNoAcred = 0;
							}
						}
						else
						{
							subtotDed = 0;
							subtotNoDed = subtot;
							ivaAcred = 0;
							ivaNoAcred = iva;
						}
					}
					else
					{
						if(pol_tFiscExt)	
						{
							if(pol_unidadFis=='PESOS')
							{
								if(subtot>pol_TopeFiscExt)
								{
									if(iva==0)
									{
										subtotDed = subtot;
										subtotNoDed = 0;
										ivaAcred = iva;
										ivaNoAcred = 0;
									}
									else
									{
										subtotDed = pol_TopeFiscNac;
										subtotNoDed = subtot - pol_TopeFiscNac;
										ivaAcred = pol_TopeFiscNac * valorIva;
										ivaNoAcred = iva - ivaAcred;
									}
								}
								else
								{
									subtotDed = subtot;
									subtotNoDed = 0;
									ivaAcred = iva;
									ivaNoAcred = 0;
								}
							}
							if(pol_unidadFis=='%')
							{
								if(iva==0)
								{
									subtotDed = subtot;
									subtotNoDed = 0;
									ivaAcred = iva;
									ivaNoAcred = 0;
								}
								else
								{
									subtotDed = subtot * pol_TopeFiscExt;
									subtotNoDed = subtot - subtotDed;
									ivaAcred = iva * pol_TopeFiscExt;
									ivaNoAcred = iva - ivaAcred;
								}
							}
						}
						else if(pol_tFiscNac)
						{
							if(pol_unidadFis=='PESOS')
							{
								if(subtot>pol_TopeFiscNac)
								{
									if(iva==0)
									{
										subtotDed = subtot;
										subtotNoDed = 0;
										ivaAcred = iva;
										ivaNoAcred = 0;
									}
									else
									{
										subtotDed = pol_TopeFiscNac;
										subtotNoDed = subtot - pol_TopeFiscNac;
										ivaAcred = pol_TopeFiscNac * valorIva;
										ivaNoAcred = iva - ivaAcred;
									}
								}
								else
								{
									subtotDed = subtot;
									subtotNoDed = 0;
									ivaAcred = iva;
									ivaNoAcred = 0;
								}
								
							}
							if(pol_unidadFis=='%')
							{
								subtotDed = subtot * pol_TopeFiscNac;
								subtotNoDed = subtot - subtotDed;
								ivaAcred = iva * pol_TopeFiscNac;
								ivaNoAcred = iva - ivaAcred;
							}
						}
						else
						{
							subtotDed = subtot;
							subtotNoDed = 0;
							ivaAcred = iva;
							ivaNoAcred = 0;
						}
					}
				}
				
				//alert('Rubro='+ tipoG +'\n pol_tFiscNac=' + pol_tFiscNac + '\n pol_tFiscExt=' + pol_tFiscExt + '\n pol_unidadFis=' + pol_unidadFis + '\n valorIva=' + valorIva + '\n subtot=' + subtot + '\n iva=' + iva  + '\n pol_TopeFiscNac=' + pol_TopeFiscNac + '\n subtotDed=' + subtotDed + '\n subtotNoDed=' + subtotNoDed + '\n ivaAcred=' + ivaAcred + '\n ivaNoAcred=' + ivaNoAcred);

				remamente = (totalFact - ((otro_subtot + otro_iva) + (subtot + iva))).toFixed(2);
				if(remamente<0)
				{
					document.getElementById('tipo'+tipoGasto+'_fact'+i+'_remamente').value = 0;
					actualizaKW('posicion', tipoGasto, handle, 'remamente', 0);
				}
				else
				{
					document.getElementById('tipo'+tipoGasto+'_fact'+i+'_remamente').value = dosDecim(remamente);
					actualizaKW('posicion', tipoGasto, handle, 'remamente', dosDecim(remamente));
					subtotNoDed = (parseFloat(subtotNoDed) + parseFloat(remamente)).toFixed(2);
				}

				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ded').value = dosDecim(subtotDed);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaAcre').value = dosDecim(ivaAcred);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_noded').value = dosDecim(subtotNoDed);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaNoAcre').value = dosDecim(ivaNoAcred);
				actualizaKW('posicion', tipoGasto, handle, 'ded', dosDecim(subtotDed));
				actualizaKW('posicion', tipoGasto, handle, 'ivaAcre', dosDecim(ivaAcred));
				actualizaKW('posicion', tipoGasto, handle, 'noDed', dosDecim(subtotNoDed));
				actualizaKW('posicion', tipoGasto, handle, 'ivaNoAcre', dosDecim(ivaNoAcred));
				actualizaKW('posicion', tipoGasto, handle, 'impLoc', 0);
			}
			var sumDed = 0.0;
			var sumNoDed = 0.0;
			var sumIVA = 0.0;
			var sumNoIVA = 0.0;
			var sumDias = 0;
			var sumReman = 0;
			for(var n = 1; n<= countFact; n++)
			{
				var ded = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ded').value;
				if (ded=='') ded = 0;
				sumDed = ((parseFloat(sumDed) + parseFloat(ded))).toFixed(2);
				var NoDed = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_noded').value;
				if (NoDed=='') NoDed = 0;
				sumNoDed = ((parseFloat(sumNoDed) + parseFloat(NoDed))).toFixed(2);
				var iva = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ivaAcre').value;
				if (iva=='') iva = 0;
				sumIVA = ((parseFloat(sumIVA) + parseFloat(iva))).toFixed(2);
				var noIVA = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ivaNoAcre').value;
				if (noIVA=='') noIVA = 0;
				sumNoIVA = ((parseFloat(sumNoIVA) + parseFloat(noIVA))).toFixed(2);
				var dias = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_dias').value;
				if (dias=='') dias = 0;
				sumDias = ((parseFloat(sumDias) + parseFloat(dias))).toFixed(2);
				var remamente = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_remamente').value;
				if (remamente=='') remamente = 0;
				sumReman = ((parseFloat(sumReman) + parseFloat(remamente))).toFixed(2);
			}
			document.getElementById('sum_tipo'+tipoGasto+'_dias').value = dosDecim(sumDias);
			
			document.getElementById('mto_tipo'+tipoGasto+'_ded').innerHTML = dosDecim(sumDed);
			document.getElementById('mto_tipo'+tipoGasto+'_noded').innerHTML = dosDecim(sumNoDed);
			document.getElementById('mto_tipo'+tipoGasto+'_iva').innerHTML = dosDecim(sumIVA);
			document.getElementById('mto_tipo'+tipoGasto+'_noiva').innerHTML = dosDecim(sumNoIVA);

			actualizaKW('sumas', tipoGasto, '', 'ded', dosDecim(sumDed));
			actualizaKW('sumas', tipoGasto, '', 'noDed', dosDecim(sumNoDed));
			actualizaKW('sumas', tipoGasto, '', 'ivaAcre', dosDecim(sumIVA));
			actualizaKW('sumas', tipoGasto, '', 'ivaNoAcre', dosDecim(sumNoIVA));
			actualizaKW('sumas', tipoGasto, '', 'detGast', dosDecim(sumDias));

			sumTotDed = (parseFloat(sumTotDed) + parseFloat(sumDed)).toFixed(2);
			sumTotNoDed = (parseFloat(sumTotNoDed) + parseFloat(sumNoDed)).toFixed(2);
			sumTotIVAAcre = (parseFloat(sumTotIVAAcre) + parseFloat(sumIVA)).toFixed(2);
			sumTotIVAnoAcre = (parseFloat(sumTotIVAnoAcre) + parseFloat(sumNoIVA)).toFixed(2);
			sumTotComp = (parseFloat(sumTotComp) + parseFloat(sumDed) + parseFloat(sumNoDed) + parseFloat(sumIVA) + parseFloat(sumNoIVA) + parseFloat(sumReman)).toFixed(2);
		break;
		case 11:
			for(var i = 1; i<= countFact; i++)
			{
				handle = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_handle').value;
				tipoFact = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_tipoFact').value;
				totalFact = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_totFact').value);
				subtot = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_subtotFact').value);
				iva = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaFact').value);
				tipoPago = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_tPago').value;
				cantItems = parseInt(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_cantItems').value, 10);
				desgloce = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_desgloce').value;
				var desgloces = desgloce.split('-');
				var otro_subtot = 0;
				var otro_iva = 0;
				if(desgloce!='')
				{
					subtot = 0;
					iva = 0;
					for(r=1;r<=250;r++)
					{
						handleItem = document.getElementById('OBKey__572_'+r).value;
						if(handleItem!='')
						{
							if(handleItem==handle)
							{
								tGastoItem = document.getElementById('OBKey__620_'+r).value;

								if(tipoGasto==tGastoItem)
								{
									subtot = subtot + parseFloat(document.getElementById('OBKey__195_'+r).value);
									tmp_iva = document.getElementById('OBKey__504_'+r).value;
									if(tmp_iva!='')
									{
										iva = iva + parseFloat(tmp_iva);
									}
								}
								else
								{
									otro_subtot = otro_subtot + parseFloat(document.getElementById('OBKey__195_'+r).value);
									otrotmp_iva = document.getElementById('OBKey__504_'+r).value;
									if(otrotmp_iva!='')
									{
										otro_iva = otro_iva + parseFloat(otrotmp_iva);
									}
								}

							}
						}
						else
						{
							break;
						}
					}
				}
				var subtotDed = 0;
				var subtotNoDed = 0;
				var ivaAcred = 0;
				var ivaNoAcred = 0;
				var unidadPorcentaje = 0;
				if((tipoFact == 'IMG') || (tipoFact == 'SCOMP'))
				{
					subtotDed = 0;
					subtotNoDed = subtot;
					ivaAcred = 0;
					ivaNoAcred = iva;
				}
				else
				{
					if(tipoPago=='1')
					{
						if(totalFact<=topeFisEfectivo)
						{
							if(pol_tFiscExt)	
							{
								if(pol_unidadFis=='PESOS')
								{
									if(subtot>pol_TopeFiscExt)
									{
										subtotDed = pol_TopeFiscExt;
										subtotNoDed = subtot - pol_TopeFiscExt;
										ivaAcred = pol_TopeFiscExt * valorIva;
										ivaNoAcred = iva - ivaAcred;
									}
									else
									{
										subtotDed = subtot;
										subtotNoDed = 0;
										ivaAcred = iva;
										ivaNoAcred = 0;
									}
								}
								if(pol_unidadFis=='%')
								{
									subtotDed = subtot * pol_TopeFiscExt;
									subtotNoDed = subtot - subtotDed;
									ivaAcred = iva * pol_TopeFiscExt;
									ivaNoAcred = iva - ivaAcred;
								}
							}
							else if(pol_tFiscNac)
							{
								if(pol_unidadFis=='PESOS')
								{
									if(subtot>pol_TopeFiscNac)
									{
										subtotDed = pol_TopeFiscNac;
										subtotNoDed = subtot - pol_TopeFiscNac;
										ivaAcred = pol_TopeFiscNac * valorIva;
										ivaNoAcred = iva - ivaAcred;
									}
									else
									{
										subtotDed = subtot;
										subtotNoDed = 0;
										ivaAcred = iva;
										ivaNoAcred = 0;
									}
									
								}
								if(pol_unidadFis=='%')
								{
									subtotDed = subtot * pol_TopeFiscNac;
									subtotNoDed = subtot - subtotDed;
									ivaAcred = iva * pol_TopeFiscNac;
									ivaNoAcred = iva - ivaAcred;
								}
							}
							else
							{
								subtotDed = subtot;
								subtotNoDed = 0;
								ivaAcred = iva;
								ivaNoAcred = 0;
							}
						}
						else
						{
							subtotDed = 0;
							subtotNoDed = subtot;
							ivaAcred = 0;
							ivaNoAcred = iva;
						}
					}
					else
					{
						if(pol_tFiscExt)	
						{
							if(pol_unidadFis=='PESOS')
							{
								if(subtot>pol_TopeFiscExt)
								{
									subtotDed = pol_TopeFiscExt;
									subtotNoDed = subtot - pol_TopeFiscExt;
									ivaAcred = pol_TopeFiscExt * valorIva;
									ivaNoAcred = iva - ivaAcred;
								}
								else
								{
									subtotDed = subtot;
									subtotNoDed = 0;
									ivaAcred = iva;
									ivaNoAcred = 0;
								}
							}
							if(pol_unidadFis=='%')
							{
								subtotDed = subtot * pol_TopeFiscExt;
								subtotNoDed = subtot - subtotDed;
								ivaAcred = iva * pol_TopeFiscExt;
								ivaNoAcred = iva - ivaAcred;
							}
						}
						else if(pol_tFiscNac)
						{
							if(pol_unidadFis=='PESOS')
							{
								if(subtot>pol_TopeFiscNac)
								{
									subtotDed = pol_TopeFiscNac;
									subtotNoDed = subtot - pol_TopeFiscNac;
									ivaAcred = pol_TopeFiscNac * valorIva;
									ivaNoAcred = iva - ivaAcred;
								}
								else
								{
									subtotDed = subtot;
									subtotNoDed = 0;
									ivaAcred = iva;
									ivaNoAcred = 0;
								}
								
							}
							if(pol_unidadFis=='%')
							{
								subtotDed = subtot * pol_TopeFiscNac;
								subtotNoDed = subtot - subtotDed;
								ivaAcred = iva * pol_TopeFiscNac;
								ivaNoAcred = iva - ivaAcred;
							}
						}
						else
						{
							subtotDed = subtot;
							subtotNoDed = 0;
							ivaAcred = iva;
							ivaNoAcred = 0;
						}
					}
				}
				
				//alert('Rubro='+ tipoG +'\n pol_tFiscNac=' + pol_tFiscNac + '\n pol_tFiscExt=' + pol_tFiscExt + '\n pol_unidadFis=' + pol_unidadFis + '\n valorIva=' + valorIva + '\n subtot=' + subtot + '\n iva=' + iva  + '\n pol_TopeFiscNac=' + pol_TopeFiscNac + '\n subtotDed=' + subtotDed + '\n subtotNoDed=' + subtotNoDed + '\n ivaAcred=' + ivaAcred + '\n ivaNoAcred=' + ivaNoAcred);

				remamente = (totalFact - ((otro_subtot + otro_iva) + (subtot + iva))).toFixed(2);
				if(remamente<0)
				{
					document.getElementById('tipo'+tipoGasto+'_fact'+i+'_remamente').value = 0;
					actualizaKW('posicion', tipoGasto, handle, 'remamente', 0);
				}
				else
				{
					document.getElementById('tipo'+tipoGasto+'_fact'+i+'_remamente').value = dosDecim(remamente);
					actualizaKW('posicion', tipoGasto, handle, 'remamente', dosDecim(remamente));
					subtotNoDed = (parseFloat(subtotNoDed) + parseFloat(remamente)).toFixed(2);
				}
				servicio = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_servicio').value);
				if(servicio>0)
				{
					subtotNoDed = (parseFloat(subtotNoDed) + parseFloat(servicio)).toFixed(2);
				}

				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ded').value = dosDecim(subtotDed);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaAcre').value = dosDecim(ivaAcred);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_noded').value = dosDecim(subtotNoDed);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaNoAcre').value = dosDecim(ivaNoAcred);
				actualizaKW('posicion', tipoGasto, handle, 'ded', dosDecim(subtotDed));
				actualizaKW('posicion', tipoGasto, handle, 'ivaAcre', dosDecim(ivaAcred));
				actualizaKW('posicion', tipoGasto, handle, 'noDed', dosDecim(subtotNoDed));
				actualizaKW('posicion', tipoGasto, handle, 'ivaNoAcre', dosDecim(ivaNoAcred));
				actualizaKW('posicion', tipoGasto, handle, 'impLoc', 0);
			}
			var sumDed = 0.0;
			var sumNoDed = 0.0;
			var sumIVA = 0.0;
			var sumNoIVA = 0.0;
			var sumServ = 0.0;
			var sumPersonas = 0;
			var sumComidas = 0.0;
			var sumReman = 0;
			for(var n = 1; n<= countFact; n++)
			{
				var ded = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ded').value;
				if (ded=='') ded = 0;
				sumDed = ((parseFloat(sumDed) + parseFloat(ded))).toFixed(2);
				var NoDed = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_noded').value;
				if (NoDed=='') NoDed = 0;
				sumNoDed = ((parseFloat(sumNoDed) + parseFloat(NoDed))).toFixed(2);
				var iva = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ivaAcre').value;
				if (iva=='') iva = 0;
				sumIVA = ((parseFloat(sumIVA) + parseFloat(iva))).toFixed(2);
				var noIVA = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ivaNoAcre').value;
				if (noIVA=='') noIVA = 0;
				sumNoIVA = ((parseFloat(sumNoIVA) + parseFloat(noIVA))).toFixed(2);
				var serv = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_servicio').value;
				if (serv=='') serv = 0;
				sumServ = ((parseFloat(sumServ) + parseFloat(serv))).toFixed(2);
				var personas = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_personas').value;
				if (personas=='') personas = 0;
				sumPersonas = sumPersonas + parseInt(personas);
				var comidas = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_comidas').value;
				if (comidas=='') comidas = 0;
				sumComidas = sumComidas + parseInt(comidas);
				var remamente = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_remamente').value;
				if (remamente=='') remamente = 0;
				sumReman = ((parseFloat(sumReman) + parseFloat(remamente))).toFixed(2);
			}
			document.getElementById('sum_tipo'+tipoGasto+'_serv').value = dosDecim(sumServ);
			document.getElementById('sum_tipo'+tipoGasto+'_personas').value = dosDecim(sumPersonas);
			document.getElementById('sum_tipo'+tipoGasto+'_comidas').value = dosDecim(sumComidas);
				
			document.getElementById('mto_tipo'+tipoGasto+'_ded').innerHTML = dosDecim(sumDed);
			document.getElementById('mto_tipo'+tipoGasto+'_noded').innerHTML = dosDecim(sumNoDed);
			document.getElementById('mto_tipo'+tipoGasto+'_iva').innerHTML = dosDecim(sumIVA);
			document.getElementById('mto_tipo'+tipoGasto+'_noiva').innerHTML = dosDecim(sumNoIVA);

			var concatDet = sumPersonas + '-' + sumComidas;

			actualizaKW('sumas', tipoGasto, '', 'ded', dosDecim(sumDed));
			actualizaKW('sumas', tipoGasto, '', 'noDed', dosDecim(sumNoDed));
			actualizaKW('sumas', tipoGasto, '', 'ivaAcre', dosDecim(sumIVA));
			actualizaKW('sumas', tipoGasto, '', 'ivaNoAcre', dosDecim(sumNoIVA));
			actualizaKW('sumas', tipoGasto, '', 'serv', dosDecim(sumServ));
			actualizaKW('sumas', tipoGasto, '', 'detGast', dosDecim(concatDet));

			sumTotDed = (parseFloat(sumTotDed) + parseFloat(sumDed)).toFixed(2);
			sumTotNoDed = (parseFloat(sumTotNoDed) + parseFloat(sumNoDed)).toFixed(2);
			sumTotIVAAcre = (parseFloat(sumTotIVAAcre) + parseFloat(sumIVA)).toFixed(2);
			sumTotIVAnoAcre = (parseFloat(sumTotIVAnoAcre) + parseFloat(sumNoIVA)).toFixed(2);
			sumTotComp = (parseFloat(sumTotComp) + parseFloat(sumDed) + parseFloat(sumNoDed) + parseFloat(sumIVA) + parseFloat(sumNoIVA)).toFixed(2);
		break;
		case 12:
			for(var i = 1; i<= countFact; i++)
			{
				handle = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_handle').value;
				tipoFact = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_tipoFact').value;
				totalFact = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_totFact').value);
				subtot = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_subtotFact').value);
				iva = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaFact').value);
				tipoPago = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_tPago').value;
				cantItems = parseInt(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_cantItems').value, 10);
				desgloce = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_desgloce').value;
				var desgloces = desgloce.split('-');
				var otro_subtot = 0;
				var otro_iva = 0;
				if(desgloce!='')
				{
					subtot = 0;
					iva = 0;
					for(r=1;r<=250;r++)
					{
						handleItem = document.getElementById('OBKey__572_'+r).value;
						if(handleItem!='')
						{
							if(handleItem==handle)
							{
								tGastoItem = document.getElementById('OBKey__620_'+r).value;

								if(tipoGasto==tGastoItem)
								{
									subtot = subtot + parseFloat(document.getElementById('OBKey__195_'+r).value);
									tmp_iva = document.getElementById('OBKey__504_'+r).value;
									if(tmp_iva!='')
									{
										iva = iva + parseFloat(tmp_iva);
									}
								}
								else
								{
									otro_subtot = otro_subtot + parseFloat(document.getElementById('OBKey__195_'+r).value);
									otrotmp_iva = document.getElementById('OBKey__504_'+r).value;
									if(otrotmp_iva!='')
									{
										otro_iva = otro_iva + parseFloat(otrotmp_iva);
									}
								}

							}
						}
						else
						{
							break;
						}
					}
				}
				var subtotDed = 0;
				var subtotNoDed = 0;
				var ivaAcred = 0;
				var ivaNoAcred = 0;
				var unidadPorcentaje = 0;
				if((tipoFact == 'IMG') || (tipoFact == 'SCOMP'))
				{
					subtotDed = 0;
					subtotNoDed = subtot;
					ivaAcred = 0;
					ivaNoAcred = iva;
				}
				else
				{
					if(tipoPago=='1')
					{
						if(totalFact<=topeFisEfectivo)
						{
							if(pol_tFiscExt)	
							{
								if(pol_unidadFis=='PESOS')
								{
									if(subtot>pol_TopeFiscExt)
									{
										subtotDed = pol_TopeFiscExt;
										subtotNoDed = subtot - pol_TopeFiscExt;
										ivaAcred = pol_TopeFiscExt * valorIva;
										ivaNoAcred = iva - ivaAcred;
									}
									else
									{
										subtotDed = subtot;
										subtotNoDed = 0;
										ivaAcred = iva;
										ivaNoAcred = 0;
									}
								}
								if(pol_unidadFis=='%')
								{
									subtotDed = subtot * pol_TopeFiscExt;
									subtotNoDed = subtot - subtotDed;
									ivaAcred = iva * pol_TopeFiscExt;
									ivaNoAcred = iva - ivaAcred;
								}
							}
							else if(pol_tFiscNac)
							{
								if(pol_unidadFis=='PESOS')
								{
									if(subtot>pol_TopeFiscNac)
									{
										subtotDed = pol_TopeFiscNac;
										subtotNoDed = subtot - pol_TopeFiscNac;
										ivaAcred = pol_TopeFiscNac * valorIva;
										ivaNoAcred = iva - ivaAcred;
									}
									else
									{
										subtotDed = subtot;
										subtotNoDed = 0;
										ivaAcred = iva;
										ivaNoAcred = 0;
									}
									
								}
								if(pol_unidadFis=='%')
								{
									subtotDed = subtot * pol_TopeFiscNac;
									subtotNoDed = subtot - subtotDed;
									ivaAcred = iva * pol_TopeFiscNac;
									ivaNoAcred = iva - ivaAcred;
								}
							}
							else
							{
								subtotDed = subtot;
								subtotNoDed = 0;
								ivaAcred = iva;
								ivaNoAcred = 0;
							}
						}
						else
						{
							subtotDed = 0;
							subtotNoDed = subtot;
							ivaAcred = 0;
							ivaNoAcred = iva;
						}
					}
					else
					{
						if(pol_tFiscExt)	
						{
							if(pol_unidadFis=='PESOS')
							{
								if(subtot>pol_TopeFiscExt)
								{
									subtotDed = pol_TopeFiscExt;
									subtotNoDed = subtot - pol_TopeFiscExt;
									ivaAcred = pol_TopeFiscExt * valorIva;
									ivaNoAcred = iva - ivaAcred;
								}
								else
								{
									subtotDed = subtot;
									subtotNoDed = 0;
									ivaAcred = iva;
									ivaNoAcred = 0;
								}
							}
							if(pol_unidadFis=='%')
							{
								subtotDed = subtot * pol_TopeFiscExt;
								subtotNoDed = subtot - subtotDed;
								ivaAcred = iva * pol_TopeFiscExt;
								ivaNoAcred = iva - ivaAcred;
							}
						}
						else if(pol_tFiscNac)
						{
							if(pol_unidadFis=='PESOS')
							{
								if(subtot>pol_TopeFiscNac)
								{
									subtotDed = pol_TopeFiscNac;
									subtotNoDed = subtot - pol_TopeFiscNac;
									ivaAcred = pol_TopeFiscNac * valorIva;
									ivaNoAcred = iva - ivaAcred;
								}
								else
								{
									subtotDed = subtot;
									subtotNoDed = 0;
									ivaAcred = iva;
									ivaNoAcred = 0;
								}
								
							}
							if(pol_unidadFis=='%')
							{
								subtotDed = subtot * pol_TopeFiscNac;
								subtotNoDed = subtot - subtotDed;
								ivaAcred = iva * pol_TopeFiscNac;
								ivaNoAcred = iva - ivaAcred;
							}
						}
						else
						{
							subtotDed = subtot;
							subtotNoDed = 0;
							ivaAcred = iva;
							ivaNoAcred = 0;
						}
					}
				}
				
				//alert('Rubro='+ tipoG +'\n pol_tFiscNac=' + pol_tFiscNac + '\n pol_tFiscExt=' + pol_tFiscExt + '\n pol_unidadFis=' + pol_unidadFis + '\n valorIva=' + valorIva + '\n subtot=' + subtot + '\n iva=' + iva  + '\n pol_TopeFiscNac=' + pol_TopeFiscNac + '\n subtotDed=' + subtotDed + '\n subtotNoDed=' + subtotNoDed + '\n ivaAcred=' + ivaAcred + '\n ivaNoAcred=' + ivaNoAcred);

				remamente = (totalFact - ((otro_subtot + otro_iva) + (subtot + iva))).toFixed(2);
				if(remamente<0)
				{
					document.getElementById('tipo'+tipoGasto+'_fact'+i+'_remamente').value = 0;
					actualizaKW('posicion', tipoGasto, handle, 'remamente', 0);
				}
				else
				{
					document.getElementById('tipo'+tipoGasto+'_fact'+i+'_remamente').value = dosDecim(remamente);
					actualizaKW('posicion', tipoGasto, handle, 'remamente', dosDecim(remamente));
					subtotNoDed = (parseFloat(subtotNoDed) + parseFloat(remamente)).toFixed(2);
				}

				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ded').value = dosDecim(subtotDed);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaAcre').value = dosDecim(ivaAcred);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_noded').value = dosDecim(subtotNoDed);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaNoAcre').value = dosDecim(ivaNoAcred);
				actualizaKW('posicion', tipoGasto, handle, 'ded', dosDecim(subtotDed));
				actualizaKW('posicion', tipoGasto, handle, 'ivaAcre', dosDecim(ivaAcred));
				actualizaKW('posicion', tipoGasto, handle, 'noDed', dosDecim(subtotNoDed));
				actualizaKW('posicion', tipoGasto, handle, 'ivaNoAcre', dosDecim(ivaNoAcred));
				actualizaKW('posicion', tipoGasto, handle, 'impLoc', 0);
			}
			var sumDed = 0.0;
			var sumNoDed = 0.0;
			var sumIVA = 0.0;
			var sumNoIVA = 0.0;
			var sumReman = 0;
			for(var n = 1; n<= countFact; n++)
			{
				var ded = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ded').value;
				if (ded=='') ded = 0;
				sumDed = ((parseFloat(sumDed) + parseFloat(ded))).toFixed(2);
				var NoDed = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_noded').value;
				if (NoDed=='') NoDed = 0;
				sumNoDed = ((parseFloat(sumNoDed) + parseFloat(NoDed))).toFixed(2);
				var iva = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ivaAcre').value;
				if (iva=='') iva = 0;
				sumIVA = ((parseFloat(sumIVA) + parseFloat(iva))).toFixed(2);
				var noIVA = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ivaNoAcre').value;
				if (noIVA=='') noIVA = 0;
				sumNoIVA = ((parseFloat(sumNoIVA) + parseFloat(noIVA))).toFixed(2);
				var remamente = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_remamente').value;
				if (remamente=='') remamente = 0;
				sumReman = ((parseFloat(sumReman) + parseFloat(remamente))).toFixed(2);
			}
			
			document.getElementById('mto_tipo'+tipoGasto+'_ded').innerHTML = dosDecim(sumDed);
			document.getElementById('mto_tipo'+tipoGasto+'_noded').innerHTML = dosDecim(sumNoDed);
			document.getElementById('mto_tipo'+tipoGasto+'_iva').innerHTML = dosDecim(sumIVA);
			document.getElementById('mto_tipo'+tipoGasto+'_noiva').innerHTML = dosDecim(sumNoIVA);

			actualizaKW('sumas', tipoGasto, '', 'ded', dosDecim(sumDed));
			actualizaKW('sumas', tipoGasto, '', 'noDed', dosDecim(sumNoDed));
			actualizaKW('sumas', tipoGasto, '', 'ivaAcre', dosDecim(sumIVA));
			actualizaKW('sumas', tipoGasto, '', 'ivaNoAcre', dosDecim(sumNoIVA));

			sumTotDed = (parseFloat(sumTotDed) + parseFloat(sumDed)).toFixed(2);
			sumTotNoDed = (parseFloat(sumTotNoDed) + parseFloat(sumNoDed)).toFixed(2);
			sumTotIVAAcre = (parseFloat(sumTotIVAAcre) + parseFloat(sumIVA)).toFixed(2);
			sumTotIVAnoAcre = (parseFloat(sumTotIVAnoAcre) + parseFloat(sumNoIVA)).toFixed(2);
			sumTotComp = (parseFloat(sumTotComp) + parseFloat(sumDed) + parseFloat(sumNoDed) + parseFloat(sumIVA) + parseFloat(sumNoIVA)).toFixed(2);
		break;
		case 13:
			for(var i = 1; i<= countFact; i++)
			{
				handle = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_handle').value;
				tipoFact = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_tipoFact').value;
				totalFact = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_totFact').value);
				subtot = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_subtotFact').value);
				iva = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaFact').value);
				tipoPago = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_tPago').value;
				cantItems = parseInt(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_cantItems').value, 10);
				desgloce = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_desgloce').value;
				var desgloces = desgloce.split('-');
				var remamente = 0.0;
				var otro_subtot = 0.0;
				var otro_iva = 0.0;
				if(desgloce!='')
				{
					subtot = 0;
					iva = 0;
					for(r=1;r<=250;r++)
					{
						handleItem = document.getElementById('OBKey__572_'+r).value;
						if(handleItem!='')
						{
							if(handleItem==handle)
							{
								tGastoItem = document.getElementById('OBKey__620_'+r).value;

								if(tipoGasto==tGastoItem)
								{
									subtot = subtot + parseFloat(document.getElementById('OBKey__195_'+r).value);
									tmp_iva = document.getElementById('OBKey__504_'+r).value;
									if(tmp_iva!='')
									{
										iva = iva + parseFloat(tmp_iva);
									}
								}
								else
								{
									otro_subtot = otro_subtot + parseFloat(document.getElementById('OBKey__195_'+r).value);
									otrotmp_iva = document.getElementById('OBKey__504_'+r).value;
									if(otrotmp_iva!='')
									{
										otro_iva = otro_iva + parseFloat(otrotmp_iva);
									}
								}

							}
						}
						else
						{
							break;
						}
					}
				}
				var subtotDed = 0;
				var subtotNoDed = 0;
				var ivaAcred = 0;
				var ivaNoAcred = 0;
				var unidadPorcentaje = 0;
				if((tipoFact == 'IMG') || (tipoFact == 'SCOMP'))
				{
					subtotDed = 0;
					subtotNoDed = subtot;
					ivaAcred = 0;
					ivaNoAcred = iva;
				}
				else
				{
					if(tipoPago=='1')
					{
						if(totalFact<=topeFisEfectivo)
						{
							if(pol_tFiscExt)	
							{
								if(pol_unidadFis=='PESOS')
								{
									if(subtot>pol_TopeFiscExt)
									{
										subtotDed = pol_TopeFiscExt;
										subtotNoDed = subtot - pol_TopeFiscExt;
										ivaAcred = pol_TopeFiscExt * valorIva;
										ivaNoAcred = iva - ivaAcred;
									}
									else
									{
										subtotDed = subtot;
										subtotNoDed = 0;
										ivaAcred = iva;
										ivaNoAcred = 0;
									}
								}
								if(pol_unidadFis=='%')
								{
									subtotDed = subtot * pol_TopeFiscExt;
									subtotNoDed = subtot - subtotDed;
									ivaAcred = iva * pol_TopeFiscExt;
									ivaNoAcred = iva - ivaAcred;
								}
							}
							else if(pol_tFiscNac)
							{
								if(pol_unidadFis=='PESOS')
								{
									if(subtot>pol_TopeFiscNac)
									{
										subtotDed = pol_TopeFiscNac;
										subtotNoDed = subtot - pol_TopeFiscNac;
										ivaAcred = pol_TopeFiscNac * valorIva;
										ivaNoAcred = iva - ivaAcred;
									}
									else
									{
										subtotDed = subtot;
										subtotNoDed = 0;
										ivaAcred = iva;
										ivaNoAcred = 0;
									}
									
								}
								if(pol_unidadFis=='%')
								{
									subtotDed = subtot * pol_TopeFiscNac;
									subtotNoDed = subtot - subtotDed;
									ivaAcred = iva * pol_TopeFiscNac;
									ivaNoAcred = iva - ivaAcred;
								}
							}
							else
							{
								subtotDed = subtot;
								subtotNoDed = 0;
								ivaAcred = iva;
								ivaNoAcred = 0;
							}
						}
						else
						{
							subtotDed = 0;
							subtotNoDed = subtot;
							ivaAcred = 0;
							ivaNoAcred = iva;
						}
					}
					else
					{
						if(pol_tFiscExt)	
						{
							if(pol_unidadFis=='PESOS')
							{
								if(subtot>pol_TopeFiscExt)
								{
									subtotDed = pol_TopeFiscExt;
									subtotNoDed = subtot - pol_TopeFiscExt;
									ivaAcred = pol_TopeFiscExt * valorIva;
									ivaNoAcred = iva - ivaAcred;
								}
								else
								{
									subtotDed = subtot;
									subtotNoDed = 0;
									ivaAcred = iva;
									ivaNoAcred = 0;
								}
							}
							if(pol_unidadFis=='%')
							{
								subtotDed = subtot * pol_TopeFiscExt;
								subtotNoDed = subtot - subtotDed;
								ivaAcred = iva * pol_TopeFiscExt;
								ivaNoAcred = iva - ivaAcred;
							}
						}
						else if(pol_tFiscNac)
						{
							if(pol_unidadFis=='PESOS')
							{
								if(subtot>pol_TopeFiscNac)
								{
									subtotDed = pol_TopeFiscNac;
									subtotNoDed = subtot - pol_TopeFiscNac;
									ivaAcred = pol_TopeFiscNac * valorIva;
									ivaNoAcred = iva - ivaAcred;
								}
								else
								{
									subtotDed = subtot;
									subtotNoDed = 0;
									ivaAcred = iva;
									ivaNoAcred = 0;
								}
								
							}
							if(pol_unidadFis=='%')
							{
								subtotDed = subtot * pol_TopeFiscNac;
								subtotNoDed = subtot - subtotDed;
								ivaAcred = iva * pol_TopeFiscNac;
								ivaNoAcred = iva - ivaAcred;
							}
						}
						else
						{
							subtotDed = subtot;
							subtotNoDed = 0;
							ivaAcred = iva;
							ivaNoAcred = 0;
						}
					}
				}
				
				//alert('Rubro='+ tipoG +'\n pol_tFiscNac=' + pol_tFiscNac + '\n pol_tFiscExt=' + pol_tFiscExt + '\n pol_unidadFis=' + pol_unidadFis + '\n valorIva=' + valorIva + '\n subtot=' + subtot + '\n iva=' + iva  + '\n pol_TopeFiscNac=' + pol_TopeFiscNac + '\n subtotDed=' + subtotDed + '\n subtotNoDed=' + subtotNoDed + '\n ivaAcred=' + ivaAcred + '\n ivaNoAcred=' + ivaNoAcred);

				remamente = (totalFact - ((otro_subtot + otro_iva) + (subtot + iva))).toFixed(2);
				if(remamente<0)
				{
					document.getElementById('tipo'+tipoGasto+'_fact'+i+'_remamente').value = 0;
					actualizaKW('posicion', tipoGasto, handle, 'remamente', 0);
				}
				else
				{
					document.getElementById('tipo'+tipoGasto+'_fact'+i+'_remamente').value = dosDecim(remamente);
					actualizaKW('posicion', tipoGasto, handle, 'remamente', dosDecim(remamente));
					subtotNoDed = (parseFloat(subtotNoDed) + parseFloat(remamente)).toFixed(2);
				}

				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ded').value = dosDecim(subtotDed);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaAcre').value = dosDecim(ivaAcred);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_noded').value = dosDecim(subtotNoDed);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaNoAcre').value = dosDecim(ivaNoAcred);
				actualizaKW('posicion', tipoGasto, handle, 'ded', dosDecim(subtotDed));
				actualizaKW('posicion', tipoGasto, handle, 'ivaAcre', dosDecim(ivaAcred));
				actualizaKW('posicion', tipoGasto, handle, 'noDed', dosDecim(subtotNoDed));
				actualizaKW('posicion', tipoGasto, handle, 'ivaNoAcre', dosDecim(ivaNoAcred));
				actualizaKW('posicion', tipoGasto, handle, 'impLoc', 0);
			}
			var sumDed = 0.0;
			var sumNoDed = 0.0;
			var sumIVA = 0.0;
			var sumNoIVA = 0.0;
			var sumKms = 0;
			var sumLts = 0.0;
			var sumReman = 0;
			for(var n = 1; n<= countFact; n++)
			{
				var ded = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ded').value;
				if (ded=='') ded = 0;
				sumDed = ((parseFloat(sumDed) + parseFloat(ded))).toFixed(2);
				var NoDed = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_noded').value;
				if (NoDed=='') NoDed = 0;
				sumNoDed = ((parseFloat(sumNoDed) + parseFloat(NoDed))).toFixed(2);
				var iva = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ivaAcre').value;
				if (iva=='') iva = 0;
				sumIVA = ((parseFloat(sumIVA) + parseFloat(iva))).toFixed(2);
				var noIVA = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ivaNoAcre').value;
				if (noIVA=='') noIVA = 0;
				sumNoIVA = ((parseFloat(sumNoIVA) + parseFloat(noIVA))).toFixed(2);
				var km = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_kms').value;
				if (km=='') km = 0;
				sumKms = sumKms + parseInt(km);
				var lts = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_litros').value;
				if (lts=='') lts = 0;
				sumLts = sumLts + parseInt(lts);
				var remamente = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_remamente').value;
				if (remamente=='') remamente = 0;
				sumReman = ((parseFloat(sumReman) + parseFloat(remamente))).toFixed(2);
			}
			document.getElementById('sum_tipo'+tipoGasto+'_kms').value = sumKms;
			document.getElementById('sum_tipo'+tipoGasto+'_litros').value = dosDecim(sumLts);

			document.getElementById('mto_tipo'+tipoGasto+'_ded').innerHTML = dosDecim(sumDed);
			document.getElementById('mto_tipo'+tipoGasto+'_noded').innerHTML = dosDecim(sumNoDed);
			document.getElementById('mto_tipo'+tipoGasto+'_iva').innerHTML = dosDecim(sumIVA);
			document.getElementById('mto_tipo'+tipoGasto+'_noiva').innerHTML = dosDecim(sumNoIVA);

			var concatDet = sumKms + '-' + sumLts;

			actualizaKW('sumas', tipoGasto, '', 'ded', dosDecim(sumDed));
			actualizaKW('sumas', tipoGasto, '', 'noDed', dosDecim(sumNoDed));
			actualizaKW('sumas', tipoGasto, '', 'ivaAcre', dosDecim(sumIVA));
			actualizaKW('sumas', tipoGasto, '', 'ivaNoAcre', dosDecim(sumNoIVA));
			actualizaKW('sumas', tipoGasto, '', 'detGast', dosDecim(concatDet));

			sumTotDed = (parseFloat(sumTotDed) + parseFloat(sumDed)).toFixed(2);
			sumTotNoDed = (parseFloat(sumTotNoDed) + parseFloat(sumNoDed)).toFixed(2);
			sumTotIVAAcre = (parseFloat(sumTotIVAAcre) + parseFloat(sumIVA)).toFixed(2);
			sumTotIVAnoAcre = (parseFloat(sumTotIVAnoAcre) + parseFloat(sumNoIVA)).toFixed(2);
			sumTotComp = (parseFloat(sumTotComp) + parseFloat(sumDed) + parseFloat(sumNoDed) + parseFloat(sumIVA) + parseFloat(sumNoIVA)).toFixed(2);
		break;
		case 14:
			for(var i = 1; i<= countFact; i++)
			{
				handle = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_handle').value;
				tipoFact = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_tipoFact').value;
				totalFact = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_totFact').value);
				subtot = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_subtotFact').value);
				iva = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaFact').value);
				tipoPago = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_tPago').value;
				cantItems = parseInt(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_cantItems').value, 10);
				desgloce = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_desgloce').value;
				var desgloces = desgloce.split('-');
				var otro_subtot = 0;
				var otro_iva = 0;
				if(desgloce!='')
				{
					subtot = 0;
					iva = 0;
					for(r=1;r<=250;r++)
					{
						handleItem = document.getElementById('OBKey__572_'+r).value;
						if(handleItem!='')
						{
							if(handleItem==handle)
							{
								tGastoItem = document.getElementById('OBKey__620_'+r).value;

								if(tipoGasto==tGastoItem)
								{
									subtot = subtot + parseFloat(document.getElementById('OBKey__195_'+r).value);
									tmp_iva = document.getElementById('OBKey__504_'+r).value;
									if(tmp_iva!='')
									{
										iva = iva + parseFloat(tmp_iva);
									}
								}
								else
								{
									otro_subtot = otro_subtot + parseFloat(document.getElementById('OBKey__195_'+r).value);
									otrotmp_iva = document.getElementById('OBKey__504_'+r).value;
									if(otrotmp_iva!='')
									{
										otro_iva = otro_iva + parseFloat(otrotmp_iva);
									}
								}

							}
						}
						else
						{
							break;
						}
					}
				}
				var subtotDed = 0;
				var subtotNoDed = 0;
				var ivaAcred = 0;
				var ivaNoAcred = 0;
				var unidadPorcentaje = 0;
				if((tipoFact == 'IMG') || (tipoFact == 'SCOMP'))
				{
					subtotDed = 0;
					subtotNoDed = subtot;
					ivaAcred = 0;
					ivaNoAcred = iva;
				}
				else
				{
					if(tipoPago=='1')
					{
						if(totalFact<=topeFisEfectivo)
						{
							if(pol_tFiscExt)	
							{
								if(pol_unidadFis=='PESOS')
								{
									if(subtot>pol_TopeFiscExt)
									{
										subtotDed = pol_TopeFiscExt;
										subtotNoDed = subtot - pol_TopeFiscExt;
										ivaAcred = pol_TopeFiscExt * valorIva;
										ivaNoAcred = iva - ivaAcred;
									}
									else
									{
										subtotDed = subtot;
										subtotNoDed = 0;
										ivaAcred = iva;
										ivaNoAcred = 0;
									}
								}
								if(pol_unidadFis=='%')
								{
									subtotDed = subtot * pol_TopeFiscExt;
									subtotNoDed = subtot - subtotDed;
									ivaAcred = iva * pol_TopeFiscExt;
									ivaNoAcred = iva - ivaAcred;
								}
							}
							else if(pol_tFiscNac)
							{
								if(pol_unidadFis=='PESOS')
								{
									if(subtot>pol_TopeFiscNac)
									{
										subtotDed = pol_TopeFiscNac;
										subtotNoDed = subtot - pol_TopeFiscNac;
										ivaAcred = pol_TopeFiscNac * valorIva;
										ivaNoAcred = iva - ivaAcred;
									}
									else
									{
										subtotDed = subtot;
										subtotNoDed = 0;
										ivaAcred = iva;
										ivaNoAcred = 0;
									}
									
								}
								if(pol_unidadFis=='%')
								{
									subtotDed = subtot * pol_TopeFiscNac;
									subtotNoDed = subtot - subtotDed;
									ivaAcred = iva * pol_TopeFiscNac;
									ivaNoAcred = iva - ivaAcred;
								}
							}
							else
							{
								subtotDed = subtot;
								subtotNoDed = 0;
								ivaAcred = iva;
								ivaNoAcred = 0;
							}
						}
						else
						{
							subtotDed = 0;
							subtotNoDed = subtot;
							ivaAcred = 0;
							ivaNoAcred = iva;
						}
					}
					else
					{
						if(pol_tFiscExt)	
						{
							if(pol_unidadFis=='PESOS')
							{
								if(subtot>pol_TopeFiscExt)
								{
									subtotDed = pol_TopeFiscExt;
									subtotNoDed = subtot - pol_TopeFiscExt;
									ivaAcred = pol_TopeFiscExt * valorIva;
									ivaNoAcred = iva - ivaAcred;
								}
								else
								{
									subtotDed = subtot;
									subtotNoDed = 0;
									ivaAcred = iva;
									ivaNoAcred = 0;
								}
							}
							if(pol_unidadFis=='%')
							{
								subtotDed = subtot * pol_TopeFiscExt;
								subtotNoDed = subtot - subtotDed;
								ivaAcred = iva * pol_TopeFiscExt;
								ivaNoAcred = iva - ivaAcred;
							}
						}
						else if(pol_tFiscNac)
						{
							if(pol_unidadFis=='PESOS')
							{
								if(subtot>pol_TopeFiscNac)
								{
									subtotDed = pol_TopeFiscNac;
									subtotNoDed = subtot - pol_TopeFiscNac;
									ivaAcred = pol_TopeFiscNac * valorIva;
									ivaNoAcred = iva - ivaAcred;
								}
								else
								{
									subtotDed = subtot;
									subtotNoDed = 0;
									ivaAcred = iva;
									ivaNoAcred = 0;
								}
								
							}
							if(pol_unidadFis=='%')
							{
								subtotDed = subtot * pol_TopeFiscNac;
								subtotNoDed = subtot - subtotDed;
								ivaAcred = iva * pol_TopeFiscNac;
								ivaNoAcred = iva - ivaAcred;
							}
						}
						else
						{
							subtotDed = subtot;
							subtotNoDed = 0;
							ivaAcred = iva;
							ivaNoAcred = 0;
						}
					}
				}
				
				//alert('Rubro='+ tipoG +'\n pol_tFiscNac=' + pol_tFiscNac + '\n pol_tFiscExt=' + pol_tFiscExt + '\n pol_unidadFis=' + pol_unidadFis + '\n valorIva=' + valorIva + '\n subtot=' + subtot + '\n iva=' + iva  + '\n pol_TopeFiscNac=' + pol_TopeFiscNac + '\n subtotDed=' + subtotDed + '\n subtotNoDed=' + subtotNoDed + '\n ivaAcred=' + ivaAcred + '\n ivaNoAcred=' + ivaNoAcred);

				remamente = (totalFact - ((otro_subtot + otro_iva) + (subtot + iva))).toFixed(2);
				if(remamente<0)
				{
					document.getElementById('tipo'+tipoGasto+'_fact'+i+'_remamente').value = 0;
					actualizaKW('posicion', tipoGasto, handle, 'remamente', 0);
				}
				else
				{
					document.getElementById('tipo'+tipoGasto+'_fact'+i+'_remamente').value = dosDecim(remamente);
					actualizaKW('posicion', tipoGasto, handle, 'remamente', dosDecim(remamente));
					subtotNoDed = (parseFloat(subtotNoDed) + parseFloat(remamente)).toFixed(2);
				}
				servicio = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_servicio').value);
				if(servicio>0)
				{
					subtotNoDed = (parseFloat(subtotNoDed) + parseFloat(servicio)).toFixed(2);
				}

				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ded').value = dosDecim(subtotDed);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaAcre').value = dosDecim(ivaAcred);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_noded').value = dosDecim(subtotNoDed);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaNoAcre').value = dosDecim(ivaNoAcred);
				actualizaKW('posicion', tipoGasto, handle, 'ded', dosDecim(subtotDed));
				actualizaKW('posicion', tipoGasto, handle, 'ivaAcre', dosDecim(ivaAcred));
				actualizaKW('posicion', tipoGasto, handle, 'noDed', dosDecim(subtotNoDed));
				actualizaKW('posicion', tipoGasto, handle, 'ivaNoAcre', dosDecim(ivaNoAcred));
				actualizaKW('posicion', tipoGasto, handle, 'impLoc', 0);
			}
			var sumDed = 0.0;
			var sumNoDed = 0.0;
			var sumIVA = 0.0;
			var sumNoIVA = 0.0;
			var sumReman = 0;
			for(var n = 1; n<= countFact; n++)
			{
				var ded = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ded').value;
				if (ded=='') ded = 0;
				sumDed = ((parseFloat(sumDed) + parseFloat(ded))).toFixed(2);
				var NoDed = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_noded').value;
				if (NoDed=='') NoDed = 0;
				sumNoDed = ((parseFloat(sumNoDed) + parseFloat(NoDed))).toFixed(2);
				var iva = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ivaAcre').value;
				if (iva=='') iva = 0;
				sumIVA = ((parseFloat(sumIVA) + parseFloat(iva))).toFixed(2);
				var noIVA = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ivaNoAcre').value;
				if (noIVA=='') noIVA = 0;
				sumNoIVA = ((parseFloat(sumNoIVA) + parseFloat(noIVA))).toFixed(2);
				var remamente = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_remamente').value;
				if (remamente=='') remamente = 0;
				sumReman = ((parseFloat(sumReman) + parseFloat(remamente))).toFixed(2);
			}
			
			document.getElementById('mto_tipo'+tipoGasto+'_ded').innerHTML = dosDecim(sumDed);
			document.getElementById('mto_tipo'+tipoGasto+'_noded').innerHTML = dosDecim(sumNoDed);
			document.getElementById('mto_tipo'+tipoGasto+'_iva').innerHTML = dosDecim(sumIVA);
			document.getElementById('mto_tipo'+tipoGasto+'_noiva').innerHTML = dosDecim(sumNoIVA);

			actualizaKW('sumas', tipoGasto, '', 'ded', dosDecim(sumDed));
			actualizaKW('sumas', tipoGasto, '', 'noDed', dosDecim(sumNoDed));
			actualizaKW('sumas', tipoGasto, '', 'ivaAcre', dosDecim(sumIVA));
			actualizaKW('sumas', tipoGasto, '', 'ivaNoAcre', dosDecim(sumNoIVA));

			sumTotDed = (parseFloat(sumTotDed) + parseFloat(sumDed)).toFixed(2);
			sumTotNoDed = (parseFloat(sumTotNoDed) + parseFloat(sumNoDed)).toFixed(2);
			sumTotIVAAcre = (parseFloat(sumTotIVAAcre) + parseFloat(sumIVA)).toFixed(2);
			sumTotIVAnoAcre = (parseFloat(sumTotIVAnoAcre) + parseFloat(sumNoIVA)).toFixed(2);
			sumTotComp = (parseFloat(sumTotComp) + parseFloat(sumDed) + parseFloat(sumNoDed) + parseFloat(sumIVA) + parseFloat(sumNoIVA)).toFixed(2);
		break;
		case 15:
			for(var i = 1; i<= countFact; i++)
			{
				handle = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_handle').value;
				tipoFact = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_tipoFact').value;
				totalFact = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_totFact').value);
				subtot = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_subtotFact').value);
				iva = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaFact').value);
				tipoPago = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_tPago').value;
				cantItems = parseInt(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_cantItems').value, 10);
				desgloce = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_desgloce').value;
				var desgloces = desgloce.split('-');
				var otro_subtot = 0;
				var otro_iva = 0;
				if(desgloce!='')
				{
					subtot = 0;
					iva = 0;
					for(r=1;r<=250;r++)
					{
						handleItem = document.getElementById('OBKey__572_'+r).value;
						if(handleItem!='')
						{
							if(handleItem==handle)
							{
								tGastoItem = document.getElementById('OBKey__620_'+r).value;

								if(tipoGasto==tGastoItem)
								{
									subtot = subtot + parseFloat(document.getElementById('OBKey__195_'+r).value);
									tmp_iva = document.getElementById('OBKey__504_'+r).value;
									if(tmp_iva!='')
									{
										iva = iva + parseFloat(tmp_iva);
									}
								}
								else
								{
									otro_subtot = otro_subtot + parseFloat(document.getElementById('OBKey__195_'+r).value);
									otrotmp_iva = document.getElementById('OBKey__504_'+r).value;
									if(otrotmp_iva!='')
									{
										otro_iva = otro_iva + parseFloat(otrotmp_iva);
									}
								}

							}
						}
						else
						{
							break;
						}
					}
				}
				var subtotDed = 0;
				var subtotNoDed = 0;
				var ivaAcred = 0;
				var ivaNoAcred = 0;
				var unidadPorcentaje = 0;
				if((tipoFact == 'IMG') || (tipoFact == 'SCOMP'))
				{
					subtotDed = 0;
					subtotNoDed = subtot;
					ivaAcred = 0;
					ivaNoAcred = iva;
				}
				else
				{
					if(tipoPago=='1')
					{
						if(totalFact<=topeFisEfectivo)
						{
							if(pol_tFiscExt)	
							{
								if(pol_unidadFis=='PESOS')
								{
									if(subtot>pol_TopeFiscExt)
									{
										subtotDed = pol_TopeFiscExt;
										subtotNoDed = subtot - pol_TopeFiscExt;
										ivaAcred = pol_TopeFiscExt * valorIva;
										ivaNoAcred = iva - ivaAcred;
									}
									else
									{
										subtotDed = subtot;
										subtotNoDed = 0;
										ivaAcred = iva;
										ivaNoAcred = 0;
									}
								}
								if(pol_unidadFis=='%')
								{
									subtotDed = subtot * pol_TopeFiscExt;
									subtotNoDed = subtot - subtotDed;
									ivaAcred = iva * pol_TopeFiscExt;
									ivaNoAcred = iva - ivaAcred;
								}
							}
							else if(pol_tFiscNac)
							{
								if(pol_unidadFis=='PESOS')
								{
									if(subtot>pol_TopeFiscNac)
									{
										subtotDed = pol_TopeFiscNac;
										subtotNoDed = subtot - pol_TopeFiscNac;
										ivaAcred = pol_TopeFiscNac * valorIva;
										ivaNoAcred = iva - ivaAcred;
									}
									else
									{
										subtotDed = subtot;
										subtotNoDed = 0;
										ivaAcred = iva;
										ivaNoAcred = 0;
									}
									
								}
								if(pol_unidadFis=='%')
								{
									subtotDed = subtot * pol_TopeFiscNac;
									subtotNoDed = subtot - subtotDed;
									ivaAcred = iva * pol_TopeFiscNac;
									ivaNoAcred = iva - ivaAcred;
								}
							}
							else
							{
								subtotDed = subtot;
								subtotNoDed = 0;
								ivaAcred = iva;
								ivaNoAcred = 0;
							}
						}
						else
						{
							subtotDed = 0;
							subtotNoDed = subtot;
							ivaAcred = 0;
							ivaNoAcred = iva;
						}
					}
					else
					{
						if(pol_tFiscExt)	
						{
							if(pol_unidadFis=='PESOS')
							{
								if(subtot>pol_TopeFiscExt)
								{
									subtotDed = pol_TopeFiscExt;
									subtotNoDed = subtot - pol_TopeFiscExt;
									ivaAcred = pol_TopeFiscExt * valorIva;
									ivaNoAcred = iva - ivaAcred;
								}
								else
								{
									subtotDed = subtot;
									subtotNoDed = 0;
									ivaAcred = iva;
									ivaNoAcred = 0;
								}
							}
							if(pol_unidadFis=='%')
							{
								subtotDed = subtot * pol_TopeFiscExt;
								subtotNoDed = subtot - subtotDed;
								ivaAcred = iva * pol_TopeFiscExt;
								ivaNoAcred = iva - ivaAcred;
							}
						}
						else if(pol_tFiscNac)
						{
							if(pol_unidadFis=='PESOS')
							{
								if(subtot>pol_TopeFiscNac)
								{
									subtotDed = pol_TopeFiscNac;
									subtotNoDed = subtot - pol_TopeFiscNac;
									ivaAcred = pol_TopeFiscNac * valorIva;
									ivaNoAcred = iva - ivaAcred;
								}
								else
								{
									subtotDed = subtot;
									subtotNoDed = 0;
									ivaAcred = iva;
									ivaNoAcred = 0;
								}
								
							}
							if(pol_unidadFis=='%')
							{
								subtotDed = subtot * pol_TopeFiscNac;
								subtotNoDed = subtot - subtotDed;
								ivaAcred = iva * pol_TopeFiscNac;
								ivaNoAcred = iva - ivaAcred;
							}
						}
						else
						{
							subtotDed = subtot;
							subtotNoDed = 0;
							ivaAcred = iva;
							ivaNoAcred = 0;
						}
					}
				}
				
				//alert('Rubro='+ tipoG +'\n pol_tFiscNac=' + pol_tFiscNac + '\n pol_tFiscExt=' + pol_tFiscExt + '\n pol_unidadFis=' + pol_unidadFis + '\n valorIva=' + valorIva + '\n subtot=' + subtot + '\n iva=' + iva  + '\n pol_TopeFiscNac=' + pol_TopeFiscNac + '\n subtotDed=' + subtotDed + '\n subtotNoDed=' + subtotNoDed + '\n ivaAcred=' + ivaAcred + '\n ivaNoAcred=' + ivaNoAcred);

				remamente = (totalFact - ((otro_subtot + otro_iva) + (subtot + iva))).toFixed(2);
				if(remamente<0)
				{
					document.getElementById('tipo'+tipoGasto+'_fact'+i+'_remamente').value = 0;
					actualizaKW('posicion', tipoGasto, handle, 'remamente', 0);
				}
				else
				{
					document.getElementById('tipo'+tipoGasto+'_fact'+i+'_remamente').value = dosDecim(remamente);
					actualizaKW('posicion', tipoGasto, handle, 'remamente', dosDecim(remamente));
					subtotNoDed = (parseFloat(subtotNoDed) + parseFloat(remamente)).toFixed(2);
				}

				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ded').value = dosDecim(subtotDed);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaAcre').value = dosDecim(ivaAcred);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_noded').value = dosDecim(subtotNoDed);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaNoAcre').value = dosDecim(ivaNoAcred);
				actualizaKW('posicion', tipoGasto, handle, 'ded', dosDecim(subtotDed));
				actualizaKW('posicion', tipoGasto, handle, 'ivaAcre', dosDecim(ivaAcred));
				actualizaKW('posicion', tipoGasto, handle, 'noDed', dosDecim(subtotNoDed));
				actualizaKW('posicion', tipoGasto, handle, 'ivaNoAcre', dosDecim(ivaNoAcred));
				actualizaKW('posicion', tipoGasto, handle, 'impLoc', 0);
			}
			var sumDed = 0.0;
			var sumNoDed = 0.0;
			var sumIVA = 0.0;
			var sumNoIVA = 0.0;
			var sumReman = 0;
			for(var n = 1; n<= countFact; n++)
			{
				var ded = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ded').value;
				if (ded=='') ded = 0;
				sumDed = sumDed + parseFloat(ded);
				var NoDed = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_noded').value;
				if (NoDed=='') NoDed = 0;
				sumNoDed = sumNoDed + parseFloat(NoDed);
				var iva = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ivaAcre').value;
				if (iva=='') iva = 0;
				sumIVA = sumIVA + parseFloat(iva);
				var noIVA = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ivaNoAcre').value;
				if (noIVA=='') noIVA = 0;
				sumNoIVA = sumNoIVA + parseFloat(noIVA);
				var remamente = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_remamente').value;
				if (remamente=='') remamente = 0;
				sumReman = sumReman + parseFloat(remamente);
			}
			
			document.getElementById('mto_tipo'+tipoGasto+'_ded').innerHTML = dosDecim(sumDed);
			document.getElementById('mto_tipo'+tipoGasto+'_noded').innerHTML = dosDecim(sumNoDed);
			document.getElementById('mto_tipo'+tipoGasto+'_iva').innerHTML = dosDecim(sumIVA);
			document.getElementById('mto_tipo'+tipoGasto+'_noiva').innerHTML = dosDecim(sumNoIVA);

			actualizaKW('sumas', tipoGasto, '', 'ded', dosDecim(sumDed));
			actualizaKW('sumas', tipoGasto, '', 'noDed', dosDecim(sumNoDed));
			actualizaKW('sumas', tipoGasto, '', 'ivaAcre', dosDecim(sumIVA));
			actualizaKW('sumas', tipoGasto, '', 'ivaNoAcre', dosDecim(sumNoIVA));

			sumTotDed = (parseFloat(sumTotDed) + parseFloat(sumDed)).toFixed(2);
			sumTotNoDed = (parseFloat(sumTotNoDed) + parseFloat(sumNoDed)).toFixed(2);
			sumTotIVAAcre = (parseFloat(sumTotIVAAcre) + parseFloat(sumIVA)).toFixed(2);
			sumTotIVAnoAcre = (parseFloat(sumTotIVAnoAcre) + parseFloat(sumNoIVA)).toFixed(2);
			sumTotComp = (parseFloat(sumTotComp) + parseFloat(sumDed) + parseFloat(sumNoDed) + parseFloat(sumIVA) + parseFloat(sumNoIVA)).toFixed(2);
		break;
		case 16:
			for(var i = 1; i<= countFact; i++)
			{
				handle = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_handle').value;
				tipoFact = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_tipoFact').value;
				totalFact = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_totFact').value);
				subtot = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_subtotFact').value);
				iva = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaFact').value);
				tipoPago = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_tPago').value;
				cantItems = parseInt(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_cantItems').value, 10);
				desgloce = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_desgloce').value;
				var desgloces = desgloce.split('-');
				var otro_subtot = 0;
				var otro_iva = 0;
				if(desgloce!='')
				{
					subtot = 0;
					iva = 0;
					for(r=1;r<=250;r++)
					{
						handleItem = document.getElementById('OBKey__572_'+r).value;
						if(handleItem!='')
						{
							if(handleItem==handle)
							{
								tGastoItem = document.getElementById('OBKey__620_'+r).value;

								if(tipoGasto==tGastoItem)
								{
									subtot = subtot + parseFloat(document.getElementById('OBKey__195_'+r).value);
									tmp_iva = document.getElementById('OBKey__504_'+r).value;
									if(tmp_iva!='')
									{
										iva = iva + parseFloat(tmp_iva);
									}
								}
								else
								{
									otro_subtot = otro_subtot + parseFloat(document.getElementById('OBKey__195_'+r).value);
									otrotmp_iva = document.getElementById('OBKey__504_'+r).value;
									if(otrotmp_iva!='')
									{
										otro_iva = otro_iva + parseFloat(otrotmp_iva);
									}
								}

							}
						}
						else
						{
							break;
						}
					}
				}
				var subtotDed = 0;
				var subtotNoDed = 0;
				var ivaAcred = 0;
				var ivaNoAcred = 0;
				var unidadPorcentaje = 0;
				if((tipoFact == 'IMG') || (tipoFact == 'SCOMP'))
				{
					subtotDed = 0;
					subtotNoDed = subtot;
					ivaAcred = 0;
					ivaNoAcred = iva;
				}
				else
				{
					if(tipoPago=='1')
					{
						if(totalFact<=topeFisEfectivo)
						{
							if(pol_tFiscExt)	
							{
								if(pol_unidadFis=='PESOS')
								{
									if(subtot>pol_TopeFiscExt)
									{
										subtotDed = pol_TopeFiscExt;
										subtotNoDed = subtot - pol_TopeFiscExt;
										ivaAcred = pol_TopeFiscExt * valorIva;
										ivaNoAcred = iva - ivaAcred;
									}
									else
									{
										subtotDed = subtot;
										subtotNoDed = 0;
										ivaAcred = iva;
										ivaNoAcred = 0;
									}
								}
								if(pol_unidadFis=='%')
								{
									subtotDed = subtot * pol_TopeFiscExt;
									subtotNoDed = subtot - subtotDed;
									ivaAcred = iva * pol_TopeFiscExt;
									ivaNoAcred = iva - ivaAcred;
								}
							}
							else if(pol_tFiscNac)
							{
								if(pol_unidadFis=='PESOS')
								{
									if(subtot>pol_TopeFiscNac)
									{
										subtotDed = pol_TopeFiscNac;
										subtotNoDed = subtot - pol_TopeFiscNac;
										ivaAcred = pol_TopeFiscNac * valorIva;
										ivaNoAcred = iva - ivaAcred;
									}
									else
									{
										subtotDed = subtot;
										subtotNoDed = 0;
										ivaAcred = iva;
										ivaNoAcred = 0;
									}
									
								}
								if(pol_unidadFis=='%')
								{
									subtotDed = subtot * pol_TopeFiscNac;
									subtotNoDed = subtot - subtotDed;
									ivaAcred = iva * pol_TopeFiscNac;
									ivaNoAcred = iva - ivaAcred;
								}
							}
							else
							{
								subtotDed = subtot;
								subtotNoDed = 0;
								ivaAcred = iva;
								ivaNoAcred = 0;
							}
						}
						else
						{
							subtotDed = 0;
							subtotNoDed = subtot;
							ivaAcred = 0;
							ivaNoAcred = iva;
						}
					}
					else
					{
						if(pol_tFiscExt)	
						{
							if(pol_unidadFis=='PESOS')
							{
								if(subtot>pol_TopeFiscExt)
								{
									subtotDed = pol_TopeFiscExt;
									subtotNoDed = subtot - pol_TopeFiscExt;
									ivaAcred = pol_TopeFiscExt * valorIva;
									ivaNoAcred = iva - ivaAcred;
								}
								else
								{
									subtotDed = subtot;
									subtotNoDed = 0;
									ivaAcred = iva;
									ivaNoAcred = 0;
								}
							}
							if(pol_unidadFis=='%')
							{
								subtotDed = subtot * pol_TopeFiscExt;
								subtotNoDed = subtot - subtotDed;
								ivaAcred = iva * pol_TopeFiscExt;
								ivaNoAcred = iva - ivaAcred;
							}
						}
						else if(pol_tFiscNac)
						{
							if(pol_unidadFis=='PESOS')
							{
								if(subtot>pol_TopeFiscNac)
								{
									subtotDed = pol_TopeFiscNac;
									subtotNoDed = subtot - pol_TopeFiscNac;
									ivaAcred = pol_TopeFiscNac * valorIva;
									ivaNoAcred = iva - ivaAcred;
								}
								else
								{
									subtotDed = subtot;
									subtotNoDed = 0;
									ivaAcred = iva;
									ivaNoAcred = 0;
								}
								
							}
							if(pol_unidadFis=='%')
							{
								subtotDed = subtot * pol_TopeFiscNac;
								subtotNoDed = subtot - subtotDed;
								ivaAcred = iva * pol_TopeFiscNac;
								ivaNoAcred = iva - ivaAcred;
							}
						}
						else
						{
							subtotDed = subtot;
							subtotNoDed = 0;
							ivaAcred = iva;
							ivaNoAcred = 0;
						}
					}
				}
				
				//alert('Rubro='+ tipoG +'\n pol_tFiscNac=' + pol_tFiscNac + '\n pol_tFiscExt=' + pol_tFiscExt + '\n pol_unidadFis=' + pol_unidadFis + '\n valorIva=' + valorIva + '\n subtot=' + subtot + '\n iva=' + iva  + '\n pol_TopeFiscNac=' + pol_TopeFiscNac + '\n subtotDed=' + subtotDed + '\n subtotNoDed=' + subtotNoDed + '\n ivaAcred=' + ivaAcred + '\n ivaNoAcred=' + ivaNoAcred);

				remamente = (totalFact - ((otro_subtot + otro_iva) + (subtot + iva))).toFixed(2);
				if(remamente<0)
				{
					document.getElementById('tipo'+tipoGasto+'_fact'+i+'_remamente').value = 0;
					actualizaKW('posicion', tipoGasto, handle, 'remamente', 0);
				}
				else
				{
					document.getElementById('tipo'+tipoGasto+'_fact'+i+'_remamente').value = dosDecim(remamente);
					actualizaKW('posicion', tipoGasto, handle, 'remamente', dosDecim(remamente));
					subtotNoDed = (parseFloat(subtotNoDed) + parseFloat(remamente)).toFixed(2);
				}

				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ded').value = dosDecim(subtotDed);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaAcre').value = dosDecim(ivaAcred);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_noded').value = dosDecim(subtotNoDed);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaNoAcre').value = dosDecim(ivaNoAcred);
				actualizaKW('posicion', tipoGasto, handle, 'ded', dosDecim(subtotDed));
				actualizaKW('posicion', tipoGasto, handle, 'ivaAcre', dosDecim(ivaAcred));
				actualizaKW('posicion', tipoGasto, handle, 'noDed', dosDecim(subtotNoDed));
				actualizaKW('posicion', tipoGasto, handle, 'ivaNoAcre', dosDecim(ivaNoAcred));
				actualizaKW('posicion', tipoGasto, handle, 'impLoc', 0);
			}
			var sumDed = 0.0;
			var sumNoDed = 0.0;
			var sumIVA = 0.0;
			var sumNoIVA = 0.0;
			var sumViajes = 0;
			var sumReman = 0;
			for(var n = 1; n<= countFact; n++)
			{
				var ded = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ded').value;
				if (ded=='') ded = 0;
				sumDed = ((parseFloat(sumDed) + parseFloat(ded))).toFixed(2);
				var NoDed = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_noded').value;
				if (NoDed=='') NoDed = 0;
				sumNoDed = ((parseFloat(sumNoDed) + parseFloat(NoDed))).toFixed(2);
				var iva = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ivaAcre').value;
				if (iva=='') iva = 0;
				sumIVA = ((parseFloat(sumIVA) + parseFloat(iva))).toFixed(2);
				var noIVA = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ivaNoAcre').value;
				if (noIVA=='') noIVA = 0;
				sumNoIVA = ((parseFloat(sumNoIVA) + parseFloat(noIVA))).toFixed(2);
				var viajes = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_viajes').value;
				if (viajes=='') viajes = 0;
				sumViajes = ((parseFloat(sumViajes) + parseFloat(viajes))).toFixed(2);
				var remamente = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_remamente').value;
				if (remamente=='') remamente = 0;
				sumReman = ((parseFloat(sumReman) + parseFloat(remamente))).toFixed(2);
			}
			
			document.getElementById('sum_tipo'+tipoGasto+'_viajes').value = dosDecim(sumViajes);
			
			document.getElementById('mto_tipo'+tipoGasto+'_ded').innerHTML = dosDecim(sumDed);
			document.getElementById('mto_tipo'+tipoGasto+'_noded').innerHTML = dosDecim(sumNoDed);
			document.getElementById('mto_tipo'+tipoGasto+'_iva').innerHTML = dosDecim(sumIVA);
			document.getElementById('mto_tipo'+tipoGasto+'_noiva').innerHTML = dosDecim(sumNoIVA);

			actualizaKW('sumas', tipoGasto, '', 'ded', dosDecim(sumDed));
			actualizaKW('sumas', tipoGasto, '', 'noDed', dosDecim(sumNoDed));
			actualizaKW('sumas', tipoGasto, '', 'ivaAcre', dosDecim(sumIVA));
			actualizaKW('sumas', tipoGasto, '', 'ivaNoAcre', dosDecim(sumNoIVA));

			sumTotDed = (parseFloat(sumTotDed) + parseFloat(sumDed)).toFixed(2);
			sumTotNoDed = (parseFloat(sumTotNoDed) + parseFloat(sumNoDed)).toFixed(2);
			sumTotIVAAcre = (parseFloat(sumTotIVAAcre) + parseFloat(sumIVA)).toFixed(2);
			sumTotIVAnoAcre = (parseFloat(sumTotIVAnoAcre) + parseFloat(sumNoIVA)).toFixed(2);
			sumTotComp = (parseFloat(sumTotComp) + parseFloat(sumDed) + parseFloat(sumNoDed) + parseFloat(sumIVA) + parseFloat(sumNoIVA)).toFixed(2);
		break;
		case 17:
			for(var i = 1; i<= countFact; i++)
			{
				handle = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_handle').value;
				tipoFact = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_tipoFact').value;
				totalFact = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_totFact').value);
				subtot = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_subtotFact').value);
				iva = parseFloat(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaFact').value);
				tipoPago = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_tPago').value;
				cantItems = parseInt(document.getElementById('tipo'+tipoGasto+'_fact'+i+'_cantItems').value, 10);
				desgloce = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_desgloce').value;
				dedudici = document.getElementById('tipo'+tipoGasto+'_fact'+i+'_deduci').value;
				
				porcentaje = parseFloat(dedudici) / 100;

				pol_TopeFiscExt = porcentaje;
				pol_TopeFiscNac = porcentaje;

				var desgloces = desgloce.split('-');
				var otro_subtot = 0;
				var otro_iva = 0;
				if(desgloce!='')
				{
					subtot = 0;
					iva = 0;
					for(r=1;r<=250;r++)
					{
						handleItem = document.getElementById('OBKey__572_'+r).value;
						if(handleItem!='')
						{
							if(handleItem==handle)
							{
								tGastoItem = document.getElementById('OBKey__620_'+r).value;

								if(tipoGasto==tGastoItem)
								{
									subtot = subtot + parseFloat(document.getElementById('OBKey__195_'+r).value);
									tmp_iva = document.getElementById('OBKey__504_'+r).value;
									if(tmp_iva!='')
									{
										iva = iva + parseFloat(tmp_iva);
									}
								}
								else
								{
									otro_subtot = otro_subtot + parseFloat(document.getElementById('OBKey__195_'+r).value);
									otrotmp_iva = document.getElementById('OBKey__504_'+r).value;
									if(otrotmp_iva!='')
									{
										otro_iva = otro_iva + parseFloat(otrotmp_iva);
									}
								}

							}
						}
						else
						{
							break;
						}
					}
				}
				var subtotDed = 0;
				var subtotNoDed = 0;
				var ivaAcred = 0;
				var ivaNoAcred = 0;
				var unidadPorcentaje = 0;
				if((tipoFact == 'IMG') || (tipoFact == 'SCOMP'))
				{
					subtotDed = 0;
					subtotNoDed = subtot;
					ivaAcred = 0;
					ivaNoAcred = iva;
				}
				else
				{
					if(tipoPago=='1')
					{
						if(totalFact<=topeFisEfectivo)
						{
							if(pol_tFiscExt)	
							{
								if(pol_unidadFis=='%')
								{
									subtotDed = subtot * pol_TopeFiscExt;
									subtotNoDed = subtot - subtotDed;
									ivaAcred = iva * pol_TopeFiscExt;
									ivaNoAcred = iva - ivaAcred;
								}
							}
							else if(pol_tFiscNac)
							{
								if(pol_unidadFis=='%')
								{
									subtotDed = subtot * pol_TopeFiscNac;
									subtotNoDed = subtot - subtotDed;
									ivaAcred = iva * pol_TopeFiscNac;
									ivaNoAcred = iva - ivaAcred;
								}
							}
							else
							{
								subtotDed = subtot;
								subtotNoDed = 0;
								ivaAcred = iva;
								ivaNoAcred = 0;
							}
						}
						else
						{
							subtotDed = 0;
							subtotNoDed = subtot;
							ivaAcred = 0;
							ivaNoAcred = iva;
						}
					}
					else
					{
						if(pol_tFiscExt)	
						{
							if(pol_unidadFis=='%')
							{
								subtotDed = subtot * pol_TopeFiscExt;
								subtotNoDed = subtot - subtotDed;
								ivaAcred = iva * pol_TopeFiscExt;
								ivaNoAcred = iva - ivaAcred;
							}
						}
						else if(pol_tFiscNac)
						{
							if(pol_unidadFis=='%')
							{
								subtotDed = subtot * pol_TopeFiscNac;
								subtotNoDed = subtot - subtotDed;
								ivaAcred = iva * pol_TopeFiscNac;
								ivaNoAcred = iva - ivaAcred;
							}
						}
						else
						{
							subtotDed = subtot;
							subtotNoDed = 0;
							ivaAcred = iva;
							ivaNoAcred = 0;
						}
					}
				}
				
				//alert('Rubro='+ tipoG +'\n pol_tFiscNac=' + pol_tFiscNac + '\n pol_tFiscExt=' + pol_tFiscExt + '\n pol_unidadFis=' + pol_unidadFis + '\n valorIva=' + valorIva + '\n subtot=' + subtot + '\n iva=' + iva  + '\n pol_TopeFiscNac=' + pol_TopeFiscNac + '\n subtotDed=' + subtotDed + '\n subtotNoDed=' + subtotNoDed + '\n ivaAcred=' + ivaAcred + '\n ivaNoAcred=' + ivaNoAcred);

				remamente = (totalFact - ((otro_subtot + otro_iva) + (subtot + iva))).toFixed(2);
				if(remamente<0)
				{
					document.getElementById('tipo'+tipoGasto+'_fact'+i+'_remamente').value = 0;
					actualizaKW('posicion', tipoGasto, handle, 'remamente', 0);
				}
				else
				{
					document.getElementById('tipo'+tipoGasto+'_fact'+i+'_remamente').value = dosDecim(remamente);
					actualizaKW('posicion', tipoGasto, handle, 'remamente', dosDecim(remamente));
					subtotNoDed = (parseFloat(subtotNoDed) + parseFloat(remamente)).toFixed(2);
				}

				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ded').value = dosDecim(subtotDed);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaAcre').value = dosDecim(ivaAcred);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_noded').value = dosDecim(subtotNoDed);
				document.getElementById('tipo'+tipoGasto+'_fact'+i+'_ivaNoAcre').value = dosDecim(ivaNoAcred);
				actualizaKW('posicion', tipoGasto, handle, 'ded', dosDecim(subtotDed));
				actualizaKW('posicion', tipoGasto, handle, 'ivaAcre', dosDecim(ivaAcred));
				actualizaKW('posicion', tipoGasto, handle, 'noDed', dosDecim(subtotNoDed));
				actualizaKW('posicion', tipoGasto, handle, 'ivaNoAcre', dosDecim(ivaNoAcred));
				actualizaKW('posicion', tipoGasto, handle, 'impLoc', 0);
			}
			var sumDed = 0.0;
			var sumNoDed = 0.0;
			var sumIVA = 0.0;
			var sumNoIVA = 0.0;
			var sumReman = 0;
			for(var n = 1; n<= countFact; n++)
			{
				var ded = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ded').value;
				if (ded=='') ded = 0;
				sumDed = ((parseFloat(sumDed) + parseFloat(ded))).toFixed(2);
				var NoDed = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_noded').value;
				if (NoDed=='') NoDed = 0;
				sumNoDed = ((parseFloat(sumNoDed) + parseFloat(NoDed))).toFixed(2);
				var iva = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ivaAcre').value;
				if (iva=='') iva = 0;
				sumIVA = ((parseFloat(sumIVA) + parseFloat(iva))).toFixed(2);
				var noIVA = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_ivaNoAcre').value;
				if (noIVA=='') noIVA = 0;
				sumNoIVA = ((parseFloat(sumNoIVA) + parseFloat(noIVA))).toFixed(2);
				var remamente = document.getElementById('tipo'+tipoGasto+'_fact'+n+'_remamente').value;
				if (remamente=='') remamente = 0;
				sumReman = ((parseFloat(sumReman) + parseFloat(remamente))).toFixed(2);
			}
			document.getElementById('mto_tipo'+tipoGasto+'_ded').innerHTML = dosDecim(sumDed);
			document.getElementById('mto_tipo'+tipoGasto+'_noded').innerHTML = dosDecim(sumNoDed);
			document.getElementById('mto_tipo'+tipoGasto+'_iva').innerHTML = dosDecim(sumIVA);
			document.getElementById('mto_tipo'+tipoGasto+'_noiva').innerHTML = dosDecim(sumNoIVA);

			actualizaKW('sumas', tipoGasto, '', 'ded', dosDecim(sumDed));
			actualizaKW('sumas', tipoGasto, '', 'noDed', dosDecim(sumNoDed));
			actualizaKW('sumas', tipoGasto, '', 'ivaAcre', dosDecim(sumIVA));
			actualizaKW('sumas', tipoGasto, '', 'ivaNoAcre', dosDecim(sumNoIVA));
			
			sumTotDed = (parseFloat(sumTotDed) + parseFloat(sumDed)).toFixed(2);
			sumTotNoDed = (parseFloat(sumTotNoDed) + parseFloat(sumNoDed)).toFixed(2);
			sumTotIVAAcre = (parseFloat(sumTotIVAAcre) + parseFloat(sumIVA)).toFixed(2);
			sumTotIVAnoAcre = (parseFloat(sumTotIVAnoAcre) + parseFloat(sumNoIVA)).toFixed(2);
			sumTotComp = (parseFloat(sumTotComp) + parseFloat(sumDed) + parseFloat(sumNoDed) + parseFloat(sumIVA) + parseFloat(sumNoIVA)).toFixed(2);
		break;

	}
	*/
}
/*=======================
Funcion Envia el valor a modificar en un campo KW para OnBase
=======================
Agrega o Modifica los valores de KW para OnBase de los comprobantes (CFDI, IMG o SCOMP), asi como de las sumas totale por tipo de gasto.
Recibe el valor a agregar o modificar de una KW, asi como el tipo y ID de la KW correspondiente.
- Para Comprobantes se busca el Hanlde del Comprobante correspondiente
- Para Sumas se busca el ID del Tipo de Gasto correspondiente
 */
function actualizaKW(tabla, tipoGasto, handle, kw, valor)
{
	switch(tabla) //Indica con que KWTG se trabajará: GV - Posicion o GV - SumasGastos
	{
		case 'posicion':
			for (var i=1; i<=100; i++) //Recorrerá todos los Records del KWTG GV - Posicion cargados en el HTML
			{
				var handleKW = document.getElementById('OBKey__565_'+i).value;
				if(handleKW == handle) //Busca la coincidencia del Record del KWTG con el Handle del Comprobante que se busca modificar
				{
					switch(kw)	
					{
						case 'RegNoC': //Modifica la KW Pos_ReglaNoCumple dentro del KWTG
							document.getElementById('OBKey__621_'+i).value = valor;
						break;
						case 'ded': //Modifica la KW Pos_Deducible dentro del KWTG
							document.getElementById('OBKey__623_'+i).value = valor;
						break;
						case 'noDed': //Modifica la KW Pos_NoDeducible dentro del KWTG
							document.getElementById('OBKey__624_'+i).value = valor;
						break;
						case 'ivaAcre': //Modifica la KW Pos_IVAacredit dentro del KWTG
							document.getElementById('OBKey__625_'+i).value = valor;
						break;
						case 'ivaNoAcre': //Modifica la KW Pos_IVAnoAcredit dentro del KWTG
							document.getElementById('OBKey__626_'+i).value = valor;
						break;
						case 'impLoc': //Modifica la KW Pos_ImpLocal dentro del KWTG
							document.getElementById('OBKey__627_'+i).value = valor;
						break;
						case 'servicio': //Modifica la KW Pos_Servicio dentro del KWTG
							document.getElementById('OBKey__628_'+i).value = valor;
						break;
						case 'remamente': //Modifica la KW Pos_Remanente dentro del KWTG
							document.getElementById('OBKey__638_'+i).value = valor;
						break;
					}
					break;
				}
			}
		break
		case 'sumas':
			for (var i=1; i<=25; i++) //Recorrerá todos los Records del KWTG GV - SumasGastos cargados en el HTML
			{
				var tipoKW = document.getElementById('OBKey__604_'+i).value;
				if(tipoKW == tipoGasto) //Busca la coincidencia del Record del KWTG con el ID del Tipo de Gasto que se busca modificar
				{
					switch(kw)
					{
						case 'ded': //Modifica la KW Sum_Deducible dentro del KWTG
							document.getElementById('OBKey__605_'+i).value = valor;
						break;
						case 'noDed': //Modifica la KW Sum_NoDeducible dentro del KWTG
							document.getElementById('OBKey__606_'+i).value = valor;
						break;
						case 'ivaAcre': //Modifica la KW Sum_IVAacredit dentro del KWTG
							document.getElementById('OBKey__607_'+i).value = valor;
						break;
						case 'ivaNoAcre': //Modifica la KW Sum_IVAnoAcredit dentro del KWTG
							document.getElementById('OBKey__608_'+i).value = valor;
						break;
						case 'impLoc': //Modifica la KW Sum_ImpLocal dentro del KWTG
							document.getElementById('OBKey__609_'+i).value = valor;
						break;
						case 'serv': //Modifica la KW Sum_Servicio dentro del KWTG
							document.getElementById('OBKey__642_'+i).value = valor;
						break;
						case 'detGast': //Modifica la KW Sum_DetalleGasto dentro del KWTG
							document.getElementById('OBKey__610_'+i).value = valor;
						break;
					}
					break;
				}
			}
		break
	}
}
/*=======================
Funcion Guarda Formulario OnBase
=======================
Permite guardar el Form en OnBase haciendo clic en el OBBtn_Yes, previa validación de errores.
 */
function submitForm()
{
	if(validaForm=='') //Variable Global podrá contener los errores concatenados en funciones previas, pues caso contrario a estar vacia mostrará el mensaje del error al usuario y abortará el guardado en OnBase
	{
		var cantErr = 0;
		var statEf;
		for(var h=0; h<=17; h++) //Recorrera el array errors[] que acumula en memoria la cantidad de errores restrictivos que se encontraron en el Form por cada tipo de gasto en funciones como ValidaReglas() SumaMontos() o CreaAlerta() esta ultima en los tipos de Alerta Restrictivos (1)
		{
			cantErr += errors[h]; //Empieza a Sumar los errores encontrados
		}
		if(cantErr>0) //Evalua si la cantidad de errores encontrados es mayor a cero
		{
			statEf = 'VALIDADO - REGLAS NO CUMPLEN' //Establece el Estatus Form para que Workflow no permita la contabilización de la comprobación hasta que el usuario rechace explicitamente los comprobantes que no cumplen con las reglas de negocio
		}
		else
		{
			statEf = 'VALIDADO - OK' //Establece el Estatus Form para que Workflow permita la contabilización
		}
		document.getElementById('OBKey__519_1').value = document.getElementById('totalComprobacion').value; //Envia al campo de la KW el Monto Total Final en Comprobación
		document.getElementById('OBKey__644_1').value = statEf; //Envia a la KW EstatusForm el valor previamente establecido para WF
		document.getElementById('submitBtn').click(); //Envia el evento de click sobre el boton guardar para OnBase
	}
	else
	{
		alert(validaForm); //Muestra mensajes de Error
	}
}
/*=======================
Función para "limpiar" espacios en cadenas
=======================
Recibe un valor string, elimina espacios en blanco con Expresion Regular y regresa el mismo Str
 */
function trim(str)
{
    return str.replace(/^\s+|\s+$/g,"");
}
/*=======================
Funcion boton Valida Reglas y Suma montos
=======================
Se ejecuta desde el boton Valida Reglas y Suma montos que ejecuta el usuario de Contraloria solo cuando la KW Estatus WF es igual a "COMPROBACION EN ANALISIS DE CONTRALORIA" y el Usuario que esta viendo el formulario en ese momento pertenece al Grupo de Usuarios de GV - Contraloria. Para mayor información de como se realiza este control revise la función cargaPagina().

Esta función realizará la ejecución de las funciones validaReglas() y sumaMontos() tantas veces como registros de cada tipo de gasto existan en el formulario, es decir se realizarán las validaciones de reglas y topes para los tipos de gasto donde haya Facturas CFDI, CCFDI, IMG o SCOMP y se realizarán las sumas de montos junto a su validación de Topes Fiscales en todos los rubros. 

Por lo que al final esta función desencaderana el llenado de campos Deducible / No Deducible / IVA Acreditable / IVA NO Acreditable de cada Comprobante visualmente en el Formulario y en KW's del KWTG GV - Posiciones que serán almacenadas en OnBase, asi como las sumas correspondientes a cada Tipo de Gasto mostradas en el Formulario y en las KW's del KWTG GV - SumasGastos que serán almacenadas en OnBase, asi como las Alertas de Validación de Reglas Topes Nadro que se generan visualmente en el Formulario y se almacenaran en KW's ReglaNocumple generales del Documento y en el KWTG GV - Posiciones.
 */
function validacionForm()
{
	var inicio = 1; //Determina el primer ID de Tipos de Gasto a recorrer, 1 es el primero de Gastos de Viaje, corresponde a Hospedaje
	var fin = 17; //Determina el ultimo ID de Tipos de Gastoa recorrer, 17 es actualmente el ultimo para Gastos Varios, corresponde a Autos Utilitarios
	
	//Inicializa variables en el ambito de la función que serviran de acumuladoras para las sumas totales de la comprobación
	sumTotComp = 0.0; 
	sumTotDed = 0.0; 
	sumTotNoDed = 0.0; 
	sumTotIVAAcre = 0.0; 
	sumTotIVAnoAcre = 0.0;

	escribirKW = true;//Se determina la variable global para que la validación de Topes si escriba en las  KW's ReglaNocumple, dado que esta función será ejecuta por el usuario de Conntraloria y SI debera guardar los cambios al Formulario

	for(var y=inicio; y<=fin; y++) //Recorre todos los tipos de gasto
	{
		//alert('exists[y] = ' + y + ' - ' + exists[y]);
		if(exists[y]) //Valida si el tipo de Gasto en curso [y] si contiene registros de comprobantes, en el inicio del form se declara array global declarando todos los tipos de gasto como false y van pasando a true en cada función creaFactCFDI() creaFactIMG() o creaConcptCFDI()
		{
			validaReglas(y); //Llama función ValidaReglas para el Tipo de Gasto en Curso
		}
		if(VistaSimple == false) //Si la variable Global VistaSimple esta activa se omite la ejecución de SumaMontos, VistaSimple esta activa normalmente para la aprobación del Autorizador, dado que esta función no podrá ejecutarse para este usuario, es casi imposible que entre a este punto. Se mantiene unicamente por control
		{
			sumaMontos(y);
		}
	}
	if(tipo == 'viaje') //Solo en caso de tratarse de una comprobación de Gastos de Viaje se realiza la validación de reglas de Negocio global tipo "0"
	{
		validaReglas('0');
	}

	if(VistaSimple == false) //Solo por control se valida variable global VistaSimple deba estar en false, al termino de recorrer todos los tipos de gasto y realizar las sumas correspondientes. Se muestra en el Form y se envian a los campos KW's los Montos finales totales totales de la comprobación correspondientes a Deducible, No Deducible, IVA Acreditable, IVA No Acreditable y Total Neto
	{
		document.getElementById('mto_tipo0_ded').innerHTML = dosDecim(sumTotDed); //
		document.getElementById('mto_tipo0_noded').innerHTML = dosDecim(sumTotNoDed);
		document.getElementById('mto_tipo0_iva').innerHTML = dosDecim(sumTotIVAAcre);
		document.getElementById('mto_tipo0_noiva').innerHTML = dosDecim(sumTotIVAnoAcre);
		actualizaKW('sumas', '0', '', 'ded', dosDecim(sumTotDed));
		actualizaKW('sumas', '0', '', 'noDed', dosDecim(sumTotNoDed));
		actualizaKW('sumas', '0', '', 'ivaAcre', dosDecim(sumTotIVAAcre));
		actualizaKW('sumas', '0', '', 'ivaNoAcre', dosDecim(sumTotIVAnoAcre));
		document.getElementById('totalComprobacion').value = dosDecim(sumTotComp);
		document.getElementById('mto_totNet').innerHTML = dosDecim(sumTotComp);
	}
}

function separacionIvas(handle)
{
	var subTot16 = 0.0;
	var subTot8 = 0.0;
	var	subTot0 = 0.0;
	var mtoIva16 = 0.0;
	var mtoIva8 = 0.0;
	var mtoIva0 = 0.0;

	for(r=1;r<=250;r++) //Recorrera cada concepto del CFDI... En este caso particular si va directo a los inputs del HTML que corresponden a los valores de KW del KWTG FE - Conceptos
	{
		handleItem = document.getElementById('OBKey__572_'+r).value;
		if(handleItem!='')//Asegura que el Handle del Registro del KWTG FE - Conceptos no este vacio
		{
			if(handleItem==handle) //Valida que el Handle del Concepto corresponda al mismo handle del Comprobante principal
			{
				var tasa = document.getElementById('OBKey__505_'+r).value;
				var cImporte = parseFloat(document.getElementById('OBKey__105_'+r)).value;
				var tImporte = parseFloat(document.getElementById('OBKey__504_'+r)).value;

				switch (tasa)
				{
					case '0.16':
						subTot16 += cImporte;
						mtoIva16 += tImporte;
					break;

					case '0.08':
						subTot8 += cImporte;
						mtoIva8 += tImporte;
					break;

					case '0':
						subTot0 += cImporte;
						mtoIva0 += tImporte;
					break;
				}
			}
		}
		else //Si el Handle esta vacio, deja de continuar recorriendo los Records del KWTG FE - Conceptos 
		{
			break;
		}
	}
}