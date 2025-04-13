document.addEventListener("DOMContentLoaded", () => {
	const loginForm = document.querySelector(".login-form")
	const registerForm = document.querySelector(".register-form")

	const createAccountBtn = document.getElementById("create-account-btn")
	const backToLoginBtn = document.getElementById("back-to-login-btn")

	createAccountBtn.addEventListener("click", e => {
		e.preventDefault()
		loginForm.classList.add("d-none")
		registerForm.classList.remove("d-none")
	})

	backToLoginBtn.addEventListener("click", e => {
		e.preventDefault()
		registerForm.classList.add("d-none")
		loginForm.classList.remove("d-none")
	})

	const registerFormElement = document.querySelector(".register-form")
	const passwordInput = document.getElementById("register-password")
	const passwordError = document.getElementById("password-error")

	registerFormElement.addEventListener("submit", e => {
		const password = passwordInput.value
		const isValid = validatePassword(password)

		if (!isValid) {
			e.preventDefault()
			passwordError.textContent =
				"Password must be at least 8 characters, include uppercase, lowercase, a number and special character."
		} else {
			passwordError.textContent = ""
		}
	})

	function validatePassword(password) {
		const length = password.length >= 8
		const upper = /[A-Z]/.test(password)
		const lower = /[a-z]/.test(password)
		const digit = /\d/.test(password)
		const special = /[!@#$%^&*(),.?":{}|<>]/.test(password)
		return length && upper && lower && digit && special
	}
})
