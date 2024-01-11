const textABox = document.getElementById("text_a");
const textBBox = document.getElementById("text_b");
const md5Button = document.getElementById("md5");
const resultBox = document.getElementById("text_result");
const hashABox = document.getElementById("hash_a");
const hashBBox = document.getElementById("hash_b");

let resetTextFields = () => {
	resultBox.value = '';
	hashABox.value = '';
	hashBBox.value = '';
	resultBox.style.color = 'revert'
}

let isValidTextFields = () => {
	resetTextFields();
	if(!textABox.value && !textBBox.value) {
		resultBox.value = 'No value specified in any textbox!';
		resultBox.style.color='red';
		return false;
	}
	return true;
}

md5Button.addEventListener("click", function() {
	if(isValidTextFields()) {
		if(textABox.value) {
			hashABox.value = md5(textABox.value);
		}
		if(textBBox.value) {
        	hashBBox.value = md5(textBBox.value);
        }
        if(!textABox.value || !textBBox.value) {
            resultBox.value = 'Hashes cannot be compared. Try putting in two values to see if they match.'
            resultBox.style.color = 'yellow';
        } else if(hashABox.value == hashBBox.value) {
            resultBox.value = 'Hashes Match!';
            resultBox.style.color = 'green';
        } else {
            resultBox.value = "Hashes Don't Match";
            resultBox.style.color = 'orange';
        }
	}
});

