const nameField = document.getElementById('text_name');
const emailField = document.getElementById('text_email');
const phoneField = document.getElementById('text_phone');
const statusField = document.getElementById('text_status');

const allFields = [nameField, emailField, phoneField];

const clearButton = document.getElementById('clear-button');
const defaultValuesButton = document.getElementById('default-values-button');
const submitButton = document.getElementById('submit-form-button');

const httpRequest = new XMLHttpRequest();
httpRequest.responseType = 'json';
httpRequest.onload = () => {
	statusField.value = 'Status Code: ' + httpRequest.status;
	if(httpRequest.status == 200) {
		statusField.value = statusField.value + ' | Successfully submitted data';
		statusField.style.color = 'green';
	} else {
		statusField.value = statusField.value + ' | Error : ' + httpRequest.response.type + ':: ' + httpRequest.response.error;
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
	statusField.value = 'Idle';

	statusField.style.color = 'revert';
	allFields.forEach((eachField) => eachField.style.borderBottom = 'revert')
}

let defaultTextFields = () => {
	nameField.value = 'John Doe';
    emailField.value = 'test@gmail.com';
    phoneField.value = '9876543210';

    statusField.style.color = 'revert';
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
	if(validFields()) {
		httpRequest.open("POST", "http://localhost:8080/user");
		let requestBody = JSON.stringify({
			'full_name': nameField.value,
			'email': emailField.value,
			'phone_number': phoneField.value
		});
		httpRequest.setRequestHeader('Content-Type','application/json');
		httpRequest.send(requestBody);
	}
}

clearButton.addEventListener("click", () => clearTextFields());
submitButton.addEventListener("click", () => submitCreateUserFields());
defaultValuesButton.addEventListener("click", () => defaultTextFields());