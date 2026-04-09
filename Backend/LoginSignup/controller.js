const User = require('./model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_jwt_secret_key_here_change_this_in_production';

// Register User with all fields
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
            userType 
        } = req.body;
        
        // Validate required fields
        if (!itNumber || !fullName || !email || !phone || !password || !confirmPassword || !department || !address) {
            return res.status(400).json({ 
                success: false,
                error: "All fields are required" 
            });
        }
        
        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ 
                success: false,
                error: "Passwords do not match" 
            });
        }
        
        // Check if password meets minimum requirements
        if (password.length < 6) {
            return res.status(400).json({ 
                success: false,
                error: "Password must be at least 6 characters long" 
            });
        }
        
        // Check if IT Number already exists
        const existingITNumber = await User.findOne({ itNumber });
        if (existingITNumber) {
            return res.status(400).json({ 
                success: false,
                error: "IT Number already exists" 
            });
        }
        
        // Check if user already exists with email
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false,
                error: "User already exists with this email" 
            });
        }
        
        // Check if phone already exists
        const existingPhone = await User.findOne({ phone });
        if (existingPhone) {
            return res.status(400).json({ 
                success: false,
                error: "Phone number already registered" 
            });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        
        // Create new user with all fields
        const user = new User({ 
            itNumber, 
            fullName, 
            email, 
            phone, 
            password: hash, 
            department, 
            address, 
            profilePhoto: profilePhoto || '',
            gender: gender || 'other',
            userType: userType || 'student'
        });
        
        const savedUser = await user.save();
        
        // Create token
        const token = jwt.sign(
            { 
                id: savedUser._id, 
                itNumber: savedUser.itNumber,
                email: savedUser.email, 
                userType: savedUser.userType, 
                fullName: savedUser.fullName,
                department: savedUser.department
            },
            JWT_SECRET,
            { expiresIn: "7d" }
        );
        
        // Set cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // Set to true if using HTTPS
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        
        res.status(201).json({ 
            success: true,
            message: "User registered successfully", 
            user: { 
                id: savedUser._id, 
                itNumber: savedUser.itNumber,
                fullName: savedUser.fullName, 
                email: savedUser.email,
                phone: savedUser.phone,
                department: savedUser.department,
                address: savedUser.address,
                profilePhoto: savedUser.profilePhoto,
                userType: savedUser.userType 
            },
            token: token
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Login User
const loginUsers = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ 
                success: false,
                message: "Email and password are required" 
            });
        }
        
        // Find user by email or IT number
        const user = await User.findOne({ 
            $or: [{ email: email }, { itNumber: email }] 
        });
        
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid email/IT Number or password" 
            });
        }
        
        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid email/IT Number or password" 
            });
        }
        
        // Create token
        const token = jwt.sign(
            { 
                id: user._id, 
                itNumber: user.itNumber,
                email: user.email, 
                userType: user.userType, 
                fullName: user.fullName,
                department: user.department
            },
            JWT_SECRET,
            { expiresIn: "7d" }
        );
        
        // Set cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        
        res.json({ 
            success: true,
            message: "Login successful", 
            user: {
                id: user._id,
                userType: user.userType,
                fullName: user.fullName,
                itNumber: user.itNumber,
                email: user.email,
                phone: user.phone,
                department: user.department,
                address: user.address,
                profilePhoto: user.profilePhoto,
                gender: user.gender,
                roomNumber: user.roomNumber
            },
            token: token
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Verify User (for protected routes)
const verifyUser = async (req, res) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: "No token provided" 
            });
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Get fresh user data from database
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: "User not found" 
            });
        }
        
        res.json({ 
            success: true,
            message: "Token is valid", 
            user: {
                id: user._id,
                itNumber: user.itNumber,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                department: user.department,
                address: user.address,
                profilePhoto: user.profilePhoto,
                userType: user.userType,
                roomNumber: user.roomNumber
            }
        });
    } catch (error) {
        console.error("Verification error:", error);
        res.status(401).json({ 
            success: false,
            message: "Invalid token" 
        });
    }
};

// Update User with all fields
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
            roomNumber
        } = req.body;
        
        if (!id) {
            return res.status(400).json({ 
                success: false,
                error: "User ID is required" 
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
            roomNumber
        };
        
        // Remove undefined fields
        Object.keys(updateData).forEach(key => 
            updateData[key] === undefined && delete updateData[key]
        );
        
        // If password is provided, hash it
        if (password && password.trim() !== "") {
            if (password.length < 6) {
                return res.status(400).json({ 
                    success: false,
                    error: "Password must be at least 6 characters long" 
                });
            }
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }
        
        // Check if new email already exists (excluding current user)
        if (email) {
            const existingEmail = await User.findOne({ email, _id: { $ne: id } });
            if (existingEmail) {
                return res.status(400).json({ 
                    success: false,
                    error: "Email already in use" 
                });
            }
        }
        
        // Check if new IT Number already exists (excluding current user)
        if (itNumber) {
            const existingITNumber = await User.findOne({ itNumber, _id: { $ne: id } });
            if (existingITNumber) {
                return res.status(400).json({ 
                    success: false,
                    error: "IT Number already in use" 
                });
            }
        }
        
        // Check if new phone already exists (excluding current user)
        if (phone) {
            const existingPhone = await User.findOne({ phone, _id: { $ne: id } });
            if (existingPhone) {
                return res.status(400).json({ 
                    success: false,
                    error: "Phone number already in use" 
                });
            }
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!updatedUser) {
            return res.status(404).json({ 
                success: false,
                error: "User not found" 
            });
        }
        
        res.json({ 
            success: true,
            message: "User updated successfully", 
            user: updatedUser
        });
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Get All Users
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        res.json({ 
            success: true,
            users 
        });
    } catch (error) {
        console.error("Get users error:", error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Get Single User
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id, '-password');
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                error: "User not found" 
            });
        }
        
        res.json({ 
            success: true,
            user 
        });
    } catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Delete User
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id);
        
        if (!deletedUser) {
            return res.status(404).json({ 
                success: false,
                error: "User not found" 
            });
        }
        
        res.json({ 
            success: true,
            message: "User deleted successfully" 
        });
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Logout User
const logoutUser = async (req, res) => {
    try {
        res.clearCookie("token");
        res.json({ 
            success: true,
            message: "Logged out successfully" 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Search Users
const searchUsers = async (req, res) => {
    try {
        const { query, field } = req.query;
        
        let searchCriteria = {};
        
        if (field === 'itNumber') {
            searchCriteria = { itNumber: { $regex: query, $options: 'i' } };
        } else if (field === 'fullName') {
            searchCriteria = { fullName: { $regex: query, $options: 'i' } };
        } else if (field === 'email') {
            searchCriteria = { email: { $regex: query, $options: 'i' } };
        } else if (field === 'department') {
            searchCriteria = { department: query };
        } else if (query) {
            searchCriteria = {
                $or: [
                    { itNumber: { $regex: query, $options: 'i' } },
                    { fullName: { $regex: query, $options: 'i' } },
                    { email: { $regex: query, $options: 'i' } },
                    { phone: { $regex: query, $options: 'i' } }
                ]
            };
        }
        
        const users = await User.find(searchCriteria, '-password');
        res.json({ 
            success: true,
            users 
        });
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Get User Profile
const getProfile = async (req, res) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: "No token provided" 
            });
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }
        
        res.json({ 
            success: true,
            user
        });
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(401).json({ 
            success: false,
            message: "Invalid token" 
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
    getProfile
};