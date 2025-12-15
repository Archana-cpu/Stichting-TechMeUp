import { useContext, useState } from "react"
import { AuthContext } from "../../contexts/auth.context"
import service from "../../services/config.services"
import { Navigate, useNavigate, Link } from "react-router-dom"

function SignUp() {

  const navigate = useNavigate()

  const { isLoggedIn, isValidating, authenticateUser } = useContext(AuthContext)

  const [body, setBody] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  })

  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setBody({
      ...body,
      [name]: value
    })
  }

  const handleSignUp = async (e) => {

    e.preventDefault()

    try {

      const response = await service.post(`auth/signup`, body)

      localStorage.setItem("authToken", response.data.authToken)

      await authenticateUser()

      navigate("/logs")

      createToast("success", `Welcome ${body.firstName}!`)

    } catch (error) {

      console.log(error.response.data.errorMessage)

      if (error.response.data.errorMessage !== "" && error.response.data.errorMessage) {
        createToast("danger", error.response.data.errorMessage)
      }
    }

  }

  if (isValidating) {
    return <Loading />
  }

  if (isLoggedIn) {
    return (
      <>
        {<Navigate to="/logs" />}
      </>
    )
  }

  return (
    <div className="bg-white w-full min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-[600px]">
        <h1 className="text-4xl font-bold mb-8 text-black">Sign Up</h1>

        <form onSubmit={handleSignUp} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-black">First Name</label>
              <input
                type="text"
                name="firstName"
                placeholder="Rena"
                onChange={handleChange}
                className="w-full h-12 bg-[#F5F5F5] text-black rounded px-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-black">Last Name</label>
              <input
                type="text"
                name="lastName"
                placeholder="Hopper"
                onChange={handleChange}
                className="w-full h-12 bg-[#F5F5F5] text-black rounded px-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-black">Email</label>
            <input
              type="email"
              name="email"
              placeholder="rena@hopper@gmail.com"
              onChange={handleChange}
              className="w-full h-12 bg-[#F5F5F5] text-black rounded px-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-black">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="****************"
                onChange={handleChange}
                className="w-full h-12 bg-[#F5F5F5] text-black rounded px-4 pr-12 outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 4C5 4 2 10 2 10s3 6 8 6 8-6 8-6-3-6-8-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm text-black">Remember me</span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full h-12 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>

          <button
            type="button"
            className="w-full h-12 border border-blue-600 text-blue-600 rounded font-medium hover:bg-blue-50 transition-colors"
          >
            Sign Up  with the App
          </button>
        </form>

        <p className="text-sm mt-6 text-black">
          Already have an account?
        </p>
      </div>
    </div>
  )
}

export default SignUp