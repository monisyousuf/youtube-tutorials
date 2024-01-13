const bodyStyles = window.getComputedStyle(document.body);
const nameField = document.getElementById('text_name');
const emailField = document.getElementById('text_email');
const phoneField = document.getElementById('text_phone');
const statusField = document.getElementById('text_status');
const statusCodeField = document.getElementById('text_status_code');
const resultsContainer = document.getElementById('results-container');
const tableNameContainer = document.getElementById('table-name');


const allFields = [nameField, emailField, phoneField];

const clearButton = document.getElementById('clear-button');
const defaultValuesButton = document.getElementById('default-values-button');
const submitButton = document.getElementById('submit-form-button');
const testConnectionButton = document.getElementById('test-connection-button');
const viewDataButton = document.getElementById('view-data-button');

const tableTemplate = {"tag":"tr","children":[
	            {"tag":"td","html":"${id}"},
	            {"tag":"td","html":"${full_name}"},
	            {"tag":"td","html":"${email}"},
	            {"tag":"td","html":"${phone_number}"},
	        ]};

const tableHeader = "<tr><th>ID</th><th>Name</th><th>Email</th><th>Phone Number</th></tr>";
const tableName = 'USER_ENTITY';
const httpRequest = new XMLHttpRequest();
const getUserDetailsRequest = new XMLHttpRequest();
httpRequest.responseType = 'json';
getUserDetailsRequest.responseType = 'json';

let populateStatusFieldsWithError = (errorType, errors) => {
	let statusFieldRows = 1;
    statusField.value = errorType;
    errors.forEach((eachError) => {
    	statusFieldRows ++;
    	statusField.value += '\r\n - ' + eachError;
    });
    statusField.rows = statusFieldRows;
    statusField.style.color = bodyStyles.getPropertyValue('--error-red');
}

let clearStatusFields = () => {
	statusCodeField.value = 'xxx'
	statusField.value = 'Idle';
	statusField.rows = 1;
	statusField.style.color = 'revert';
}

let destroyResultsTable = () => {
	resultsContainer.textContent = '';
	tableNameContainer.textContent = '';
}

let transformUserResultsToTable = (data) => {
	destroyResultsTable();
	let tableHtml = json2html.render(data, tableTemplate);
	if(tableHtml != '') {
		tableNameContainer.textContent = tableName;
		resultsContainer.insertAdjacentHTML("afterBegin", tableHeader + tableHtml);
	}
}

httpRequest.onload = () => {
	statusCodeField.value = httpRequest.status + ' ' + getFriendlyStatus(httpRequest.status);
	if(httpRequest.status == 200 || httpRequest.status == 201) {
		statusField.value = JSON.stringify(httpRequest.response);
		statusField.rows = ((statusField.value.length / 36) + 1);
		statusField.style.color = bodyStyles.getPropertyValue('--pastel-green');
	} else {
		populateStatusFieldsWithError(httpRequest.response.type, httpRequest.response.error);
	}
}

getUserDetailsRequest.onload = () => {
	statusCodeField.value = getUserDetailsRequest.status + ' ' + getFriendlyStatus(getUserDetailsRequest.status);
	if(getUserDetailsRequest.status == 200) {
		statusField.value = JSON.stringify(getUserDetailsRequest.response).length == 2 ? 'Received Data : No Results Found' : 'Received Data';
		statusField.style.color = bodyStyles.getPropertyValue('--pastel-green');
		transformUserResultsToTable(JSON.stringify(getUserDetailsRequest.response));
	} else {
		populateStatusFieldsWithError(getUserDetailsRequest.response.type, getUserDetailsRequest.response.error);
	}
}

httpRequest.onerror = () => {
	statusField.value = 'The backend server is not accessible';
	statusField.style.color = bodyStyles.getPropertyValue('--error-red');
}

getUserDetailsRequest.onerror = () => {
	statusField.value = 'The backend server is not accessible';
	statusField.style.color = bodyStyles.getPropertyValue('--error-red');
}

let clearTextFields = () => {
	nameField.value = '';
	emailField.value = '';
	phoneField.value = '';
	clearStatusFields();
	destroyResultsTable();
	allFields.forEach((eachField) => eachField.style.borderBottom = 'revert')
}

let defaultTextFields = () => {
	nameField.value = 'John Doe';
    emailField.value = 'test@gmail.com';
    phoneField.value = '9876543210';
	clearStatusFields();
    allFields.forEach((eachField) => eachField.style.borderBottom = 'revert')
}

let isEmpty = (fieldName) => {
	return !fieldName.value;
}

let validFields = () => {
	let anyEmptyField = false;
	allFields.forEach((eachField) => {
		eachField.style.borderBottom = 'revert';
		if(isEmpty(eachField)) {
			anyEmptyField = true;
            eachField.style.borderBottom = '1px solid ' + bodyStyles.getPropertyValue('--error-red');
		}
	});
	return !anyEmptyField;
}

let testConnection = () => {
	clearStatusFields();
	httpRequest.open("GET", "http://localhost:8080/ping");
	httpRequest.send();
}

let getUserDetails = () => {
	clearStatusFields();
	getUserDetailsRequest.open("GET", "http://localhost:8080/user");
    getUserDetailsRequest.send();
}

let submitCreateUserFields = () => {
	clearStatusFields();
	if(validFields()) {
		httpRequest.open("POST", "http://localhost:8080/user");
		let requestBody = JSON.stringify({
			'full_name': nameField.value,
			'email': emailField.value,
			'phone_number': phoneField.value
		});
		httpRequest.setRequestHeader('Content-Type','application/json');
		httpRequest.send(requestBody);
	} else {
		populateStatusFieldsWithError('EMPTY_FIELDS', ['Fields marked in red were left empty'])
	}
}

clearButton.addEventListener("click", () => clearTextFields());
submitButton.addEventListener("click", () => submitCreateUserFields());
defaultValuesButton.addEventListener("click", () => defaultTextFields());
testConnectionButton.addEventListener("click", () => testConnection());
viewDataButton.addEventListener("click", () => getUserDetails())