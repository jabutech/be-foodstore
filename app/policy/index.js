// (1) Import abilityBuilder dan Ability
const { AbilityBuilder, Ability } = require("@casl/ability");

// (2) Buat object policy
const policies = {
  // Role guest
  guest(user, { can }) {
    // Hak akses
    // Membaca
    can("read", "Product");
  },

  //   Role User
  user(user, { can }) {
    // Hak akses
    // Membaca daftar 'Order'
    can("view", "Order");

    // Membuat 'Order'
    can("create", "Order");

    // Membaca 'Order' hanya miliknya
    can("read", "Order", { user_id: user._id });

    // Mengupdate data dirinya sendiri
    can("update", "User", { _id: user._id });

    // membaca `Cart` miliknya
    can("read", "Cart", { user_id: user._id });

    // mengupdate `Cart` miliknya
    can("update", "Cart", { user_id: user.id });

    // melihat daftar `DeliveryAddress`
    can("view", "DeliveryAddress");

    // membuat `DeliveryAddress`
    can("create", "DeliveryAddress", { user_id: user._id });

    // membaca `DeliveryAddress` miliknya
    can("read", "DeliveryAddress", { user_id: user._id });

    // mengupdate `DeliveryAddress` miliknya
    can("update", "DeliveryAddress", { user_id: user._id });

    // menghapus `DeliveryAddress` miliknya
    can("delete", "DeliveryAddress", { user_id: user._id });

    // membaca `Invoice` miliknya
    can("read", "Invoice", { user_id: user._id });
  },

  //   Role admin
  admin(user, { can }) {
    //   Hak akses
    // Manage apapun
    can("manage", "all");
  },
};

// Function manage policy
function policyFor(user) {
  let builder = new AbilityBuilder();
  if (user && typeof policies[user.role] === "function") {
    policies[user.role](user, builder);
  } else {
    policies["guest"](user, builder);
  }
  return new Ability(builder.rules);
}

module.exports = {
  policyFor,
};
