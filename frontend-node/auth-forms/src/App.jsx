import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Zap } from "lucide-react"
import { apiService } from "./services/api"
import { useToast } from "./components/ui/toast"
import "./App.css"

export default function App() {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
  })
  const { showToast, ToastContainer } = useToast()

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isLogin) {
        // Login
        const response = await apiService.login({
          email: formData.email,
          password: formData.password
        })
        
        // Store tokens
        apiService.setTokens(response.access_token, response.refresh_token)
        
        showToast("Login successful! Welcome back!", "success")
        console.log("Login successful:", response)
        
        // You can redirect to dashboard or home page here
        // window.location.href = '/dashboard'
        
      } else {
        // Signup
        const signupData = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone || undefined
        }
        
        const response = await apiService.signup(signupData)
        
        showToast("Account created successfully! Please check your email for verification.", "success")
        console.log("Signup successful:", response)
        
        // Switch to login mode after successful signup
        setIsLogin(true)
        setFormData({
          username: "",
          email: "",
          password: "",
          first_name: "",
          last_name: "",
          phone: "",
        })
      }
    } catch (error) {
      console.error("Authentication error:", error)
      showToast(error.message || "An error occurred. Please try again.", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setFormData({
      username: "",
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      phone: "",
    })
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      {/* Animated Orange Light Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Floating Light Orbs */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-orange-400 rounded-full opacity-20 blur-xl animate-float-slow"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-orange-500 rounded-full opacity-30 blur-lg animate-float-medium"></div>
        <div className="absolute top-1/2 left-3/4 w-40 h-40 bg-orange-300 rounded-full opacity-15 blur-2xl animate-float-fast"></div>
        <div className="absolute bottom-1/4 left-1/2 w-28 h-28 bg-orange-600 rounded-full opacity-25 blur-xl animate-float-reverse"></div>

        {/* Lightning-like animated lines */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/3 left-0 w-1 h-32 bg-gradient-to-b from-transparent via-orange-400 to-transparent opacity-40 animate-lightning-1"></div>
          <div className="absolute top-2/3 right-1/4 w-1 h-24 bg-gradient-to-b from-transparent via-orange-500 to-transparent opacity-30 animate-lightning-2"></div>
          <div className="absolute bottom-1/3 left-1/3 w-1 h-28 bg-gradient-to-b from-transparent via-orange-300 to-transparent opacity-35 animate-lightning-3"></div>
        </div>

        {/* Pulsing gradient overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-orange-100/10 via-transparent to-transparent animate-pulse-slow"></div>
      </div>

      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <Zap className="h-8 w-8 text-orange-500" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {isLogin ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {isLogin ? "Sign in to your account to continue" : "Sign up to get started with your account"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-gray-700 font-semibold text-base">
                      Username *
                    </Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="Enter username (min 3 characters)"
                      value={formData.username}
                      onChange={handleInputChange}
                      required={!isLogin}
                      minLength={3}
                      disabled={isLoading}
                      className="border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-white text-gray-900 font-medium placeholder:text-gray-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name" className="text-gray-700 font-semibold text-base">
                        First Name *
                      </Label>
                      <Input
                        id="first_name"
                        name="first_name"
                        type="text"
                        placeholder="John"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        required={!isLogin}
                        disabled={isLoading}
                        className="border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-white text-gray-900 font-medium placeholder:text-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name" className="text-gray-700 font-semibold text-base">
                        Last Name *
                      </Label>
                      <Input
                        id="last_name"
                        name="last_name"
                        type="text"
                        placeholder="Doe"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        required={!isLogin}
                        disabled={isLoading}
                        className="border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-white text-gray-900 font-medium placeholder:text-gray-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700 font-semibold text-base">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-white text-gray-900 font-medium placeholder:text-gray-500"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-semibold text-base">
                  Email *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-white text-gray-900 font-medium placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-semibold text-base">
                  Password *
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  disabled={isLoading}
                  className="border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-white text-gray-900 font-medium placeholder:text-gray-500"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {isLogin ? "Signing In..." : "Creating Account..."}
                  </div>
                ) : (
                  isLogin ? "Sign In" : "Create Account"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center">
              <span className="text-gray-600">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
              </span>
              <button
                type="button"
                onClick={toggleMode}
                disabled={isLoading}
                className="text-orange-500 hover:text-orange-600 font-semibold disabled:opacity-50"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </div>

            {isLogin && (
              <div className="text-center">
                <button 
                  type="button"
                  disabled={isLoading}
                  className="text-orange-500 hover:text-orange-600 text-sm font-medium disabled:opacity-50"
                >
                  Forgot your password?
                </button>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  )
}
