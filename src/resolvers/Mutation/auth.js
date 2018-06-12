const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mail = require('../../mail');

const auth = {
  async signup(parent, args, ctx, info) {
    const password = await bcrypt.hash(args.password, 10);
    const user = await ctx.db.mutation.createUser({
      data: { ...args, password },
    });

    return {
      token: jwt.sign({ userId: user.id }, process.env.APP_SECRET),
      user,
    };
  },

  async login(parent, { email, password }, ctx, info) {
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      throw new Error(`No such user found for email: ${email}`);
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error('Invalid password');
    }

    return {
      token: jwt.sign({ userId: user.id }, process.env.APP_SECRET),
      user,
    };
  },

  async recover(parent, { email, baseUrl }, ctx, info) {
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      throw new Error(`No such user found for email: ${email}`);
    }
    const resetToken = crypto.randomBytes(20).toString('hex') + Date.now();
    const resetExpires = new Date(Date.now() + 360000);
    const resetUrl = `${baseUrl}/reset/${resetToken}`;
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email },
      data: { resetToken, resetExpires },
    });

    await mail.send({
      user: updatedUser,
      subject: 'Password Reset - WatchWord',
      resetUrl,
    });

    return updatedUser;
  },

  async reset(parent, { resetToken, ...args }, ctx, info) {
    const user = await ctx.db.query.user({
      where: { resetToken },
    });
    if (!user) {
      throw new Error(`Your reset token was not found.`);
    }

    if (user.resetExpires === null || user.resetExpires > Date.now()) {
      throw new Error(`Your reset token is expired.`);
    }

    const match = await bcrypt.compare(args.password, user.password);
    if (match) {
      throw new Error(`You cannot reset your password to the same password.`);
    }

    const password = await bcrypt.hash(args.password, 10);
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { resetToken },
      data: { password, resetExpires: null },
    });

    return updatedUser;
  },
};

module.exports = { auth };
