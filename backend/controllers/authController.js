const jwt = require('jsonwebtoken');
const { User, Parent, ActivityLog } = require('../models');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'intellitots_super_secret_jwt_key_2026', {
    expiresIn: process.env.JWT_EXPIRE || '24h'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (or Admin restricted depending on role)
const register = async (req, res) => {
  try {
    const { name, email, password, role, parentDetails } = req.body;

    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email.' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Parent'
    });

    // If role is Parent, automatically create parent record
    if (user.role === 'Parent' && parentDetails) {
      await Parent.create({
        userId: user.id,
        name: parentDetails.name || name,
        mobileNumber: parentDetails.mobileNumber || '',
        email: email,
        occupation: parentDetails.occupation || '',
        address: parentDetails.address || '',
        relationType: parentDetails.relationType || 'Guardian'
      });
    }

    // Log action
    await ActivityLog.create({
      userId: user.id,
      action: 'USER_REGISTER',
      details: `Registered account: ${email} (${user.role})`
    });

    res.status(201).json({
      success: true,
      token: generateToken(user.id),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('[Auth Controller] Register error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.', error: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password.' });
    }

    const user = await User.findOne({ where: { email } });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    if (user.status === 'Inactive') {
      return res.status(403).json({ success: false, message: 'Your account is deactivated.' });
    }

    // Log action
    await ActivityLog.create({
      userId: user.id,
      action: 'USER_LOGIN',
      details: `Successfully logged in: ${email}`
    });

    res.json({
      success: true,
      token: generateToken(user.id),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('[Auth Controller] Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.', error: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    let details = {};

    if (user.role === 'Parent') {
      details = await Parent.findOne({ where: { userId: user.id } });
    }

    res.json({
      success: true,
      user,
      details
    });
  } catch (error) {
    console.error('[Auth Controller] GetMe error:', error);
    res.status(500).json({ success: false, message: 'Server error loading profile.' });
  }
};

// @desc    Logout user (Session invalidation client-side, but logs audit trail)
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    await ActivityLog.create({
      userId: req.user.id,
      action: 'USER_LOGOUT',
      details: `Logged out: ${req.user.email}`
    });
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Logout failed.' });
  }
};

module.exports = { register, login, getMe, logout };
