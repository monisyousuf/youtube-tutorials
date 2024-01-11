/**
!! This is only for demonstration purposes, don't use this code in production !!
**/

const textABox = document.getElementById("text_a");
const textBBox = document.getElementById("text_b");
const md5Button = document.getElementById("md5Btn");
const sha1Button = document.getElementById("sha1Btn");
const sha256Button = document.getElementById("sha256Btn");
const bcryptButton = document.getElementById("bcryptBtn");
const resultBox = document.getElementById("text_result");
const hashABox = document.getElementById("hash_a");
const hashBBox = document.getElementById("hash_b");
const hashLengthBox = document.getElementById("hash_length");
const bcrypt = dcodeIO.bcrypt;
/** Don't do static salting in production, this is only for demonstration :) */
const salt = bcrypt.genSaltSync(10);
hashLengthBox.value = '---';

let resetTextFields = () => {
	resultBox.value = '';
	hashABox.value = '';
	hashBBox.value = '';
	hashLengthBox.value = '---';
	resultBox.style.color = 'revert'
}

let isValidTextFields = () => {
	if(!textABox.value && !textBBox.value) {
		resultBox.value = 'No value specified in any textbox!';
		resultBox.style.color='red';
		return false;
	}
	return true;
}

let runHashing = (algorithmFunction) => {
	resetTextFields();
	if(isValidTextFields()) {
		let lengthOfHash = '----';
		if(textABox.value) {
			hashABox.value = algorithmFunction(textABox.value);
			lengthOfHash = hashABox.value.length;
		}
		if(textBBox.value) {
        	hashBBox.value = algorithmFunction(textBBox.value);
        	lengthOfHash = hashBBox.value.length;
        }
        hashLengthBox.value = lengthOfHash;
        if(!textABox.value || !textBBox.value) {
            resultBox.value = 'Hashes cannot be compared. Try putting in two values to see if they match.'
            resultBox.style.color = 'yellow';
            resultBox.style.fontSize = '1em';
        } else if(hashABox.value == hashBBox.value) {
            resultBox.value = 'Hashes Match!';
            resultBox.style.color = 'green';
        } else {
            resultBox.value = "Hashes Don't Match. No Collision.";
            resultBox.style.color = 'orange';
        }
	}
}

let runBcrypt = (password) => {
	return bcrypt.hashSync(password, salt);
}

md5Button.addEventListener("click", () => runHashing(md5));
sha1Button.addEventListener("click", () => runHashing(sha1));
sha256Button.addEventListener("click", () => runHashing(sha256));
bcryptButton.addEventListener("click", () => runHashing(runBcrypt));

