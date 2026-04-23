require("dotenv").config();

const User = require("./model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "your_jwt_secret_key_here_change_this_in_production";

const DEFAULT_ADMIN_EMAIL = "admin@gmail.com";
const DEFAULT_ADMIN_PASSWORD = "admin@123";
const DEFAULT_ADMIN_PROFILE = {
  itNumber: "ADMIN001",
  fullName: "System Admin",
  phone: "0700000000",
  department: "Other",
  address: "Hostel Administration Office",
  userType: "admin",
  roomNumber: "",
  block: "",
  isActive: true,
};

function extractToken(req) {
  const authHeader = req.headers.authorization || "";

  if (authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  return req.cookies?.token || null;
}

function deriveBlock(roomNumber = "", block = "") {
  if (block && String(block).trim()) {
    return String(block).trim();
  }

  const normalizedRoomNumber = String(roomNumber || "").trim();
  if (!normalizedRoomNumber) {
    return "";
  }

  if (normalizedRoomNumber.includes("-")) {
    return normalizedRoomNumber.split("-")[0].trim().toUpperCase();
  }

  const firstChar = normalizedRoomNumber.charAt(0);
  return /[A-Za-z]/.test(firstChar) ? firstChar.toUpperCase() : "";
}

function resolveActiveStatus(status, isActive) {
  if (typeof isActive === "boolean") {
    return isActive;
  }

  if (typeof status === "string") {
    return status.toLowerCase() !== "blocked";
  }

  return true;
}

function buildUserResponse(user) {
  return {
    id: user._id,
    itNumber: user.itNumber,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    department: user.department,
    address: user.address,
    profilePhoto: user.profilePhoto,
    gender: user.gender,
    userType: user.userType,
    roomNumber: user.roomNumber || "",
    block: user.block || deriveBlock(user.roomNumber),
    joiningDate: user.joiningDate || user.createdAt,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function getUserFromToken(req, includePassword = false) {
  const token = extractToken(req);

  if (!token) {
    return null;
  }

  const decoded = jwt.verify(token, JWT_SECRET);
  const query = User.findById(decoded.id);
  return includePassword ? query : query.select("-password");
}

async function ensureDefaultAdminUser(loginEmail, loginPassword) {
  const normalizedEmail = String(loginEmail || "").trim().toLowerCase();
  if (
    normalizedEmail !== DEFAULT_ADMIN_EMAIL ||
    String(loginPassword || "") !== DEFAULT_ADMIN_PASSWORD
  ) {
    return null;
  }

  let adminUser = await User.findOne({ email: DEFAULT_ADMIN_EMAIL });
  if (adminUser) {
    return adminUser;
  }

  const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
  adminUser = new User({
    ...DEFAULT_ADMIN_PROFILE,
    email: DEFAULT_ADMIN_EMAIL,
    password: hashedPassword,
  });

  return adminUser.save();
}

const registerUsers = async (req, res) => {
  try {
    const {
      itNumber,
      fullName,
      email,
      phone,
      password,
      confirmPassword,
      department,
      address,
      profilePhoto,
      gender,
      userType,
      roomNumber,
      block,
      joiningDate,
      status,
      isActive,
    } = req.body;

    if (
      !itNumber ||
      !fullName ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword ||
      !department ||
      !address
    ) {
      return res.status(400).json({
        success: false,
        error: "All required fields must be provided",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "Passwords do not match",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long",
      });
    }

    const [existingITNumber, existingUser, existingPhone] = await Promise.all([
      User.findOne({ itNumber }),
      User.findOne({ email }),
      User.findOne({ phone }),
    ]);

    if (existingITNumber) {
      return res.status(400).json({
        success: false,
        error: "IT Number already exists",
      });
    }

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "User already exists with this email",
      });
    }

    if (existingPhone) {
      return res.status(400).json({
        success: false,
        error: "Phone number already registered",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = new User({
      itNumber,
      fullName,
      email,
      phone,
      password: hash,
      department,
      address,
      profilePhoto: profilePhoto || "",
      gender: gender || "other",
      userType: userType || "student",
      roomNumber: roomNumber || "",
      block: deriveBlock(roomNumber, block),
      joiningDate: joiningDate ? new Date(joiningDate) : undefined,
      isActive: resolveActiveStatus(status, isActive),
    });

    const savedUser = await user.save();

    const token = jwt.sign(
      {
        id: savedUser._id,
        itNumber: savedUser.itNumber,
        email: savedUser.email,
        userType: savedUser.userType,
        fullName: savedUser.fullName,
        department: savedUser.department,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: buildUserResponse(savedUser),
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const loginUsers = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedIdentifier = String(email || "").trim();

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    let user = await User.findOne({
      $or: [{ email: normalizedEmail }, { itNumber: normalizedIdentifier }],
    });

    if (!user) {
      user = await ensureDefaultAdminUser(normalizedEmail, password);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email/IT Number or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email/IT Number or password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        itNumber: user.itNumber,
        email: user.email,
        userType: user.userType,
        fullName: user.fullName,
        department: user.department,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: "Login successful",
      user: buildUserResponse(user),
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const verifyUser = async (req, res) => {
  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found or token missing",
      });
    }

    return res.json({
      success: true,
      message: "Token is valid",
      user: buildUserResponse(user),
    });
  } catch (error) {
    console.error("Verification error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      itNumber,
      fullName,
      email,
      phone,
      password,
      department,
      address,
      profilePhoto,
      gender,
      roomNumber,
      block,
      joiningDate,
      status,
      isActive,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    const updateData = {
      itNumber,
      fullName,
      email,
      phone,
      department,
      address,
      profilePhoto,
      gender,
      roomNumber,
      joiningDate: joiningDate ? new Date(joiningDate) : undefined,
    };

    if (roomNumber !== undefined || block !== undefined) {
      updateData.block = deriveBlock(roomNumber, block);
    }

    if (status !== undefined || typeof isActive === "boolean") {
      updateData.isActive = resolveActiveStatus(status, isActive);
    }

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    if (password && password.trim() !== "") {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: "Password must be at least 6 characters long",
        });
      }
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const [existingEmail, existingITNumber, existingPhone] = await Promise.all([
      email ? User.findOne({ email, _id: { $ne: id } }) : null,
      itNumber ? User.findOne({ itNumber, _id: { $ne: id } }) : null,
      phone ? User.findOne({ phone, _id: { $ne: id } }) : null,
    ]);

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        error: "Email already in use",
      });
    }

    if (existingITNumber) {
      return res.status(400).json({
        success: false,
        error: "IT Number already in use",
      });
    }

    if (existingPhone) {
      return res.status(400).json({
        success: false,
        error: "Phone number already in use",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    return res.json({
      success: true,
      message: "User updated successfully",
      user: buildUserResponse(updatedUser),
    });
  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password").sort({ createdAt: -1 });
    return res.json({
      success: true,
      users: users.map(buildUserResponse),
    });
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    return res.json({
      success: true,
      user: buildUserResponse(user),
    });
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    return res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { query, field } = req.query;

    let searchCriteria = {};

    if (field === "itNumber") {
      searchCriteria = { itNumber: { $regex: query, $options: "i" } };
    } else if (field === "fullName") {
      searchCriteria = { fullName: { $regex: query, $options: "i" } };
    } else if (field === "email") {
      searchCriteria = { email: { $regex: query, $options: "i" } };
    } else if (field === "department") {
      searchCriteria = { department: query };
    } else if (field === "block") {
      searchCriteria = { block: { $regex: query, $options: "i" } };
    } else if (query) {
      searchCriteria = {
        $or: [
          { itNumber: { $regex: query, $options: "i" } },
          { fullName: { $regex: query, $options: "i" } },
          { email: { $regex: query, $options: "i" } },
          { phone: { $regex: query, $options: "i" } },
          { roomNumber: { $regex: query, $options: "i" } },
          { block: { $regex: query, $options: "i" } },
        ],
      };
    }

    const users = await User.find(searchCriteria, "-password");
    return res.json({
      success: true,
      users: users.map(buildUserResponse),
    });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      user: buildUserResponse(user),
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await getUserFromToken(req, true);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found or token missing",
      });
    }

    const { fullName, email, phone, department, address, profilePhoto, gender } =
      req.body;

    const [existingEmail, existingPhone] = await Promise.all([
      email ? User.findOne({ email, _id: { $ne: user._id } }) : null,
      phone ? User.findOne({ phone, _id: { $ne: user._id } }) : null,
    ]);

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone number already in use",
      });
    }

    if (fullName !== undefined) user.fullName = fullName;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (department !== undefined) user.department = department;
    if (address !== undefined) user.address = address;
    if (profilePhoto !== undefined) user.profilePhoto = profilePhoto;
    if (gender !== undefined) user.gender = gender;

    await user.save();

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: buildUserResponse(user),
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found or token missing",
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  registerUsers,
  loginUsers,
  verifyUser,
  updateUser,
  getUsers,
  getUserById,
  deleteUser,
  logoutUser,
  searchUsers,
  getProfile,
  updateProfile,
  changePassword,
};
