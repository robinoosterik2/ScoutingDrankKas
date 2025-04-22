// import { User } from '@/server/models/user';

// const isAdmin = async function (params: any): Promise<boolean> {
// 	const user = await User.findById(params._id).populate("role");

// 	if (!user) {
// 	  return false;
// 	}
	
// 	const role = user.role;
// 	console.log(role);
	
// 	if (!role) {
// 	  return false;
// 	}
	
// 	if (role.rolePermissions.includes("admin")) {
// 	  return true;
// 	}
	
// 	return false;
// };

// export default isAdmin;