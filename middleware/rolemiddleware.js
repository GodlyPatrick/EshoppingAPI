
//middleware/isSeller.js
export const isSeller = (req, res, next) => {
  if (
    req.user && req.user.role === "seller" && req.user.sellerStatus === "approved" ||
    req.user.role === "admin" ||
    req.user.role === "superAdmin"
  ) {
    next();
  } else {
  return res.status(403).json({ message: "Seller access required! ⚠" });
}};

// middleware/isAdmin.js
export const isAdmin = (req, res, next) => {
  if (
    (req.user && req.user.role === "admin") ||
    req.user.role === "superAdmin"
  ) {
    next();
  } else {
  return res.status(403).json({ message: "Admin access required! ⚠" });
}};

// middleware/isSuperAdmin.js
export const isSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === "superAdmin") {
    next();
  } else {
  return res.status(403).json({ message: "Super Admin access required! ⚠" });
}};



