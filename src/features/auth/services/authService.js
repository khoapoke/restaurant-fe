import apiClient from '../../../lib/axios'

/**
 * Service gọi API xác thực (Authentication)
 * Tham chiếu đặc tả: docs/modules/auth.md
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

/**
 * UC USR-07: Yêu cầu gửi mã OTP quên mật khẩu về email
 * POST /api/v1/auth/forgot-password
 */
export const forgotPasswordApi = async ({ email }) => {
  return await apiClient.post('/auth/forgot-password', {
    email,
  })
}

/**
 * UC USR-08: Xác nhận OTP & đặt lại mật khẩu mới
 * POST /api/v1/auth/reset-password
 */
export const resetPasswordApi = async ({
  email,
  otp,
  password,
  passwordConfirmation,
}) => {
  return await apiClient.post('/auth/reset-password', {
    email,
    otp,
    password,
    password_confirmation: passwordConfirmation,
    passwordConfirmation,
  })
}
