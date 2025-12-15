import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../../contexts/auth.context"
import service from "../../services/config.services"
import { Navigate, useNavigate, Link } from "react-router-dom"

function Login() {

  const navigate = useNavigate()

  const { isLoggedIn, isValidating, authenticateUser} = useContext(AuthContext) 

  const [body, setBody] = useState({
    email: "",
    password: ""
  }) 
  
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    e.target.name === "email" ? setBody({
      ...body, email: e.target.value
    }) : e.target.name === "password" ? setBody({
      ...body, password: e.target.value
    }) : null
  }

   const handleLogin = async (e) => {

    e.preventDefault()

    try {

      const response = await service.post( `auth/login`, body)
      
      localStorage.setItem("authToken", response.data.authToken)
      
      await authenticateUser()
      
      navigate("/logs")

      createToast("success", `Welcome ${body.email}!`)

    } catch (error) {

        console.log(error.response.data.errorMessage)

        if(error.response.data.errorMessage !== "" && error.response.data.errorMessage ){
          createToast("danger", error.response.data.errorMessage)
        }
    }

  }

  
  if(isValidating){
    return <Loading/>
  }

  if(isLoggedIn){
    return (
        <>
        {<Navigate to="/logs" />}
        </>
    )
  }

  return (
    <div className="bg-white w-full min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-[500px]">
        <h1 className="text-4xl font-bold mb-8 text-black">Log In</h1>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-black">Email Address</label>
            <input 
              type="email" 
              name="email" 
              placeholder="adamjohnson@example.com" 
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
                placeholder="password" 
                onChange={handleChange} 
                className="w-full h-12 bg-[#F5F5F5] text-black rounded px-4 pr-12 outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-400" 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 4C5 4 2 10 2 10s3 6 8 6 8-6 8-6-3-6-8-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">It must be a combination of minimum 8 letters, numbers, and symbols.</p>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm text-black">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button 
            type="submit" 
            className="w-full h-12 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors"
          >
            Log In
          </button>

          <button 
            type="button"
            className="w-full h-12 border border-blue-600 text-blue-600 rounded font-medium hover:bg-blue-50 transition-colors"
          >
            Log in with App
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-black">
          No account yet? <Link to="/signup" className="text-blue-600 hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  )
}

export default Login