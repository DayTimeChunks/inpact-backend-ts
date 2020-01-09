export const getUsersSampleData = (): any[] => {
  // We need to find a way to make this a little bit more scalable
  // 1
  const admin_user_pablo = [{
    email: "pablo@admin.com",
    name: "Pablo",
    last_name: "",
    username: "pablo",
    password: "password",
    is_admin: "true",
    address: "",
    country: "",
    avatar: "\x6e2f61",
    about_me: "",
    education: "",
    experiences: "",
    interests: "",
  }];

  const admin_user_antoine = [{
    email: "antoine@admin.com",
    name: "Antoine",
    last_name: "",
    username: "antoine",
    password: "password",
    is_admin: "true",
    address: "",
    country: "",
    avatar: "\x6e2f61",
    about_me: "",
    education: "",
    experiences: "",
    interests: "",
  }];

  const basic_user_1 = [{
    email: "basicuser1@test.com",
    name: "Pedro",
    last_name: "Vacher",
    username: "Pedrito",
    password: "password",
    is_admin: "false",
    address: "",
    country: "",
    avatar: "\x6e2f61",
    about_me: "",
    education: "",
    experiences: "",
    interests: "",
  }];
  const user_no_avatar = [{
    email: "usernoavatar@test.com",
    name: "Random",
    last_name: "Jones",
    username: "jones",
    password: "password",
    is_admin: "false",
    address: "",
    country: "",
    about_me: "",
    education: "",
    experiences: "",
    interests: "",
  }];

  return [
    ...admin_user_pablo,
    ...admin_user_antoine,
    ...basic_user_1,
    ...user_no_avatar,
  ];
}