function getKeyExpression() {
    const baseSecret = process.env.BASE_SECRET;
  
    if (!/^[a-zA-Z0-9+/=]+$/.test(baseSecret)) {
      throw new Error("Invalid BASE_SECRET value");
    }
  
    return `SUBSTRING(SHA2('${baseSecret}', 256), 1, 16)`;
  }
  
  module.exports = { getKeyExpression };