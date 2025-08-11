
export default class UserDTO {
    constructor(user) {
        this.id = user._id?.toString?.() ?? user.id;
        this.first_name = user.first_name;
        this.last_name = user.last_name;
        this.email = user.email;
        this.age = user.age;
        this.role = user.role || 'user';

        this.cart = user.cart?._id?.toString?.() ?? user.cart ?? null;
    }
}

