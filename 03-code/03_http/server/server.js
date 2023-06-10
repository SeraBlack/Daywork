const express = require("express");
const app = express();

// 设置静态文件目录的中间件
app.use(express.static("public"));
// 解析请求参数的中间件
app.use(express.json());
// 用户数组数据
const users = [
  {
    id: 1,
    name: "jack",
  },
  {
    id: 2,
    name: "rose",
  },
];
// get请求
app.get("/users", (req, res) => {
  res.json({
    code: 200,
    message: "",
    success: true,
    data: users,
  });
});
// post 请求
app.post("/user", (req, res) => {
  const { name } = req.body;
  users.push({
    id: users.length,
    name,
  });
  res.json({
    code: 200,
    message: "",
    success: true,
    data: null,
  });
});

app.listen(3000, "localhost", (err) => {
  if (err) console.log(err);
  else console.log("服务器启动成功了");
});
