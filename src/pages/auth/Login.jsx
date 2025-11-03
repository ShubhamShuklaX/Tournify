import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Logged in successfully!");
      navigate("/dashboard");
    }

    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-100 font-[Poppins,sans-serif]">
      {/* Blurred Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/Illustration.png"
          alt="Ultimate Frisbee background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[6px]" />
      </div>

      {/* Centered Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white/70 backdrop-blur-xl shadow-2xl rounded-3xl px-10 py-8 sm:px-12 sm:py-10 border border-white/40">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img
            src="/logo.png"
            alt="Y-Ultimate Logo"
            className="w-20 h-20 object-contain drop-shadow-md"
          />
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 text-center mb-2 tracking-tight">
          Welcome Back
        </h1>
        <p className="text-gray-600 text-sm sm:text-base text-center mb-8">
          Reconnect with your Y-Ultimate community!
        </p>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div>
            <Label
              htmlFor="email"
              className="text-gray-700 text-sm font-semibold block mb-1"
            >
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-300 transition-all placeholder:text-gray-400"
              required
            />
          </div>

          {/* Password */}
          <div>
            <Label
              htmlFor="password"
              className="text-gray-700 text-sm font-semibold block mb-1"
            >
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-300 transition-all placeholder:text-gray-400"
              required
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white text-lg font-semibold rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-300"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        {/* Footer Links */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-orange-600 hover:underline font-semibold"
          >
            Sign up
          </Link>
        </p>

        <p className="mt-2 text-center text-xs text-gray-500">
          Built for Y-Ultimate • Open Source
        </p>
      </div>
    </div>
  );
}
