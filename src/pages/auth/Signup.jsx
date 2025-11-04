import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "", // Changed from fullName to name
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!formData.role) {
      toast.error("Please select your role");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return;
    }

    setLoading(true);

    const { error } = await signUp(
      formData.email,
      formData.password,
      formData.name,
      formData.role
    );

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account created successfully!");
      navigate("/login");
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

      {/* Centered Signup Card */}
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
          Join Y-Ultimate
        </h1>
        <p className="text-gray-600 text-sm sm:text-base text-center mb-8">
          Be part of India's growing Ultimate Frisbee community!
        </p>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-5">
          {/* Full Name - FIXED: Changed id and name to "name" */}
          <div>
            <Label
              htmlFor="name"
              className="text-gray-700 text-sm font-semibold block mb-1"
            >
              Full Name
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-300 transition-all placeholder:text-gray-400"
              required
            />
          </div>

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
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-300 transition-all placeholder:text-gray-400"
              required
            />
          </div>

          {/* Role Select - FIXED: Correct role values and removed restricted roles */}
          <div>
            <Label
              htmlFor="role"
              className="text-gray-700 text-sm font-medium block mb-1"
            >
              Role
            </Label>
            <Select
              onValueChange={(value) =>
                setFormData({ ...formData, role: value })
              }
            >
              <SelectTrigger className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="player">Player</SelectItem>
                <SelectItem value="team_manager">Team Manager</SelectItem>
                <SelectItem value="spectator">Spectator</SelectItem>
              </SelectContent>
            </Select>
            {formData.role && (
              <p className="text-xs text-gray-500 mt-1">
                {formData.role === "player" &&
                  "Join as a player to participate in tournaments and track your stats."}
                {formData.role === "team_manager" &&
                  "Create, manage, and register your Ultimate team easily."}
                {formData.role === "spectator" &&
                  "Follow tournaments and view live scores."}
              </p>
            )}
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
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-300 transition-all placeholder:text-gray-400"
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <Label
              htmlFor="confirmPassword"
              className="text-gray-700 text-sm font-semibold block mb-1"
            >
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={handleChange}
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
            {loading ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>

        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-orange-600 hover:underline font-semibold"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
