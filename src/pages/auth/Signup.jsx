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
    category: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const tournamentRoles = [
    "Tournament Director",
    "Team Manager / Captain",
    "Player",
    "Volunteer / Field Official",
    "Scoring / Tech Team",
    "Sponsor / Partner",
    "Spectator / Fan",
  ];

  const coachingRoles = [
    "Programme Director / Admin",
    "Programme Manager",
    "Coach / Session Facilitator",
    "Reporting / Data Team",
    "Community / School Coordinator",
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!formData.category) {
      toast.error("Please select your category (Tournament/Coaching)");
      return;
    }
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

    // ✅ Map human-readable roles to valid database keys
    const roleMap = {
      "Tournament Director": "tournament_director",
      "Team Manager / Captain": "team_manager",
      Player: "player",
      "Volunteer / Field Official": "volunteer",
      "Scoring / Tech Team": "scoring_team",
      "Sponsor / Partner": "spectator",
      "Spectator / Fan": "spectator",
      "Programme Director / Admin": "coach",
      "Programme Manager": "coach",
      "Coach / Session Facilitator": "coach",
      "Reporting / Data Team": "coach",
      "Community / School Coordinator": "coach",
    };

    const normalizedRole = roleMap[formData.role] || "spectator";

    // ✅ Send only normalized role
    const { error } = await signUp(
      formData.email,
      formData.password,
      formData.name,
      normalizedRole
    );

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account created successfully!");
      navigate("/login");
    }

    setLoading(false);
  };

  const availableRoles =
    formData.category === "tournament"
      ? tournamentRoles
      : formData.category === "coaching"
      ? coachingRoles
      : [];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-100 font-[Poppins,sans-serif]">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/Illustration.png"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[6px]" />
      </div>

      {/* Signup Card */}
      <div className="relative z-10 w-full max-w-md bg-white/70 backdrop-blur-xl shadow-2xl rounded-3xl px-10 py-8 sm:px-12 sm:py-10 border border-white/40">
        <div className="flex justify-center mb-4">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-20 h-20 object-contain drop-shadow-md"
          />
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 text-center mb-2">
          Join Y-Ultimate
        </h1>
        <p className="text-gray-600 text-sm text-center mb-8">
          Choose your category and role to get started.
        </p>

        <form onSubmit={handleSignup} className="space-y-5">
          {/* Name */}
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              onValueChange={(value) =>
                setFormData({ ...formData, category: value, role: "" })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tournament">Tournament</SelectItem>
                <SelectItem value="coaching">Coaching</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Role */}
          {formData.category && (
            <div>
              <Label htmlFor="role">Role</Label>
              <Select
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Password */}
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white text-lg font-semibold rounded-xl shadow-lg"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>

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
