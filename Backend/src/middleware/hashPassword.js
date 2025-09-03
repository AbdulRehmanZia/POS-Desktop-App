import bcrypt from "bcrypt";

const hashedPasswordMiddleware = async (params, next) => {
  if (
    params.model === "User" &&
    (params.action === "create" || params.action === "update")
  ) {
    const password = params.args.data.password;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      //   console.log("PARAMS=>", params)
      params.args.data.password = hashedPassword;
    }
  }

  const result = await next(params);
  return result;
};

export default hashedPasswordMiddleware;
