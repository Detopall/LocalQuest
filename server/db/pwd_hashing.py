import bcrypt

def verify_password(plain_password: str, hashed_password: str) -> bool:
	"""
	Verify a plain password against a hashed password

	Args:
		plain_password (str): Plain password
		hashed_password (str): Hashed password

	Returns:
		bool
	"""

	if isinstance(hashed_password, str):
		hashed_password = hashed_password.encode('utf-8')
	return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password)

def hash_password(password: str):
	"""
	Hash a password

	Args:
		password (str): Password

	Returns:
		str (hashed password)
	"""

	return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
