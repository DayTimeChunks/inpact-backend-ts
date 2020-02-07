import * as bcrypt from 'bcryptjs'
export const getUsersSampleData = (): any[] => {
  // We need to find a way to make this a little bit more scalable
  // 1

  const salt = bcrypt.genSaltSync();
  const hash = bcrypt.hashSync('password', salt);

  const admin_user_pablo = [{
    email: "pablo@admin.com",
    first_name: "Pablo",
    last_name: "",
    user_name: "pablo",
    password: hash,
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
    first_name: "Antoine",
    last_name: "",
    user_name: "antoine",
    password: hash,
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
    first_name: "Pedro",
    last_name: "Vacher",
    user_name: "Pedrito",
    password: hash,
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
    first_name: "Random",
    last_name: "Jones",
    user_name: "jones",
    password: hash,
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