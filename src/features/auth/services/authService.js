import apiClient from '../../../lib/axios'

/**
 * Service gọi API xác thực (Authentication)
 * Tham chiếu đặc tả: docs/api/auth.md
 */

export const loginApi = async ({ username, password, rememberMe = false }) => {
  return await apiClient.post('/auth/login', {
    username,
    password,
    rememberMe,
  })
}

export const registerApi = async ({
  username,
  password,
  passwordConfirmation,
  email,
  fullName,
  phoneNumber,
  birthDate,
  address,
}) => {
  return await apiClient.post('/auth/register', {
    username,
    password,
    passwordConfirmation,
    email,
    fullName,
    phoneNumber,
    birthDate,
    address,
  })
}

export const logoutApi = async () => {
  return await apiClient.post('/auth/logout')
}
