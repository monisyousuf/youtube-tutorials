const nameField = document.getElementById('text_name');
const emailField = document.getElementById('text_email');
const phoneField = document.getElementById('text_phone');
const statusField = document.getElementById('text_status');
const statusCodeField = document.getElementById('text_status_code');

const allFields = [nameField, emailField, phoneField];

const clearButton = document.getElementById('clear-button');
const defaultValuesButton = document.getElementById('default-values-button');
const submitButton = document.getElementById('submit-form-button');

const httpRequest = new XMLHttpRequest();
httpRequest.responseType = 'json';

let populateStatusFieldsWithError = (errorType, errors) => {
	let statusFieldRows = 1;
    statusField.value = errorType;
    errors.forEach((eachError) => {
    	statusFieldRows ++;
    	statusField.value += '\r\n - ' + eachError;
    });
    statusField.rows = statusFieldRows;
    statusField.style.color = 'orange'
}

let clearStatusFields = () => {
	statusCodeField.value = 'xxx'
	statusField.value = 'Idle';
	statusField.rows = 1;
	statusField.style.color = 'revert';
}

httpRequest.onload = () => {
	statusCodeField.value = httpRequest.status + ' ' + getFriendlyStatus(httpRequest.status);
	if(httpRequest.status == 200) {
		statusField.value = 'Successfully submitted data';
		statusField.style.color = 'green';
	} else {
		populateStatusFieldsWithError(httpRequest.response.type, httpRequest.response.error);
	}
}

httpRequest.onerror = () => {
	statusField.value = 'The backend server is not accessible';
	statusField.style.color = 'red';
}
httpRequest.onprogress = (event) => {
	statusField.value = 'Sending Request...';
	statusField.style.color = 'orange';
}

let clearTextFields = () => {
	nameField.value = '';
	emailField.value = '';
	phoneField.value = '';
	clearStatusFields();
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
            eachField.style.borderBottom = '1px solid red';
		}
	});
	return !anyEmptyField;
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