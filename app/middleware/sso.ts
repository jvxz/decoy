import { MatrixError } from 'matrix-js-sdk'

export default defineNuxtRouteMiddleware(async route => {
  const loginToken = route.query.loginToken
  if (!isString(loginToken))
    return navigateTo({
      name: 'login',
      query: {
        errCode: 'M_UNKNOWN',
        errMsg: encodeURIComponent('No login token found'),
      },
    })

  const storedBaseUrl = await idb.get<string>(SSO_BASE_URL_KEY)
  if (!isString(storedBaseUrl))
    return navigateTo({
      name: 'login',
      query: {
        errCode: 'M_UNKNOWN',
        errMsg: encodeURIComponent('No base URL found'),
      },
    })

  const res = await loginUser({ baseUrl: storedBaseUrl, token: loginToken, type: 'm.login.token' })
  if (res instanceof MatrixError)
    return navigateTo({
      name: 'login',
      query: {
        errCode: res.errcode ? encodeURIComponent(res.errcode) : 'M_UNKNOWN',
        errMsg: encodeURIComponent(res.message),
      },
    })

  return navigateTo('/app/me/home', { external: true })
})
