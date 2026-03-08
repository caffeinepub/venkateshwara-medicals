import Map "mo:core/Map";
import Text "mo:core/Text";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Float "mo:core/Float";
import Migration "migration";

(with migration = Migration.run)
actor {
  type Category = {
    #medicines;
    #firstAid;
    #personalCare;
    #medicalEquipment;
    #vitaminsSupplements;
  };

  module Category {
    public func toText(category : Category) : Text {
      switch (category) {
        case (#medicines) { "Medicines" };
        case (#firstAid) { "First Aid" };
        case (#personalCare) { "Personal Care" };
        case (#medicalEquipment) { "Medical Equipment" };
        case (#vitaminsSupplements) { "Vitamins & Supplements" };
      };
    };
  };

  type Product = {
    id : Nat;
    name : Text;
    category : Category;
    description : Text;
    price : Float;
    imageUrl : Text;
    stockAvailable : Bool;
    featured : Bool;
  };

  module Product {
    public func compare(p1 : Product, p2 : Product) : Order.Order {
      Nat.compare(p1.id, p2.id);
    };
  };

  type Order = {
    orderId : Nat;
    timestamp : Time.Time;
    customerName : Text;
    phoneNumber : Text;
    address : {
      line1 : Text;
      city : Text;
      pincode : Text;
    };
    prescriptionNote : ?Text;
    items : [{ productId : Nat; quantity : Nat }];
    totalPrice : Float;
    paymentStatus : {
      #awaitingVerification;
      #paymentConfirmed;
      #rejected;
    };
    transactionId : ?Text;
  };

  type PlaceOrderRequest = {
    customerName : Text;
    phoneNumber : Text;
    address : {
      line1 : Text;
      city : Text;
      pincode : Text;
    };
    prescriptionNote : ?Text;
    items : [{ productId : Nat; quantity : Nat }];
  };

  type PlaceOrderResponse = {
    orderId : Nat;
    timestamp : Time.Time;
    totalPrice : Float;
  };

  let products = Map.empty<Nat, Product>();
  let orders = Map.empty<Nat, Order>();
  var nextProductId = 1;
  var nextOrderId = 1;

  func addProduct(product : Product) {
    products.add(product.id, product);
    nextProductId += 1;
  };

  public func seedProducts() : () {
    if (products.size() > 0) {
      return;
    };

    let initialProducts : [Product] = [
      {
        id = 1;
        name = "Paracetamol Tablets";
        category = #medicines;
        description = "Pain reliever and fever reducer. Contains 500mg of paracetamol per tablet.";
        price = 50.0;
        imageUrl = "/assets/generated/paracetamol.jpg";
        stockAvailable = true;
        featured = true;
      },
      {
        id = 2;
        name = "Bandages (Pack of 10)";
        category = #firstAid;
        description = "Assorted bandages for minor cuts and scrapes. Waterproof and flexible.";
        price = 85.0;
        imageUrl = "/assets/generated/bandages.jpg";
        stockAvailable = true;
        featured = false;
      },
      {
        id = 3;
        name = "Digital Thermometer";
        category = #medicalEquipment;
        description = "Fast and accurate digital thermometer for oral, rectal, or underarm use.";
        price = 250.0;
        imageUrl = "/assets/generated/thermometer.jpg";
        stockAvailable = true;
        featured = true;
      },
      {
        id = 4;
        name = "Hand Sanitizer (500ml)";
        category = #personalCare;
        description = "Kills 99.9% of germs. Contains 70% alcohol for effective cleaning.";
        price = 120.0;
        imageUrl = "/assets/generated/sanitizer.jpg";
        stockAvailable = true;
        featured = true;
      },
      {
        id = 5;
        name = "Vitamin C Tablets (1000mg)";
        category = #vitaminsSupplements;
        description = "Supports immune system health. Contains 60 tablets.";
        price = 180.0;
        imageUrl = "/assets/generated/vitaminc.jpg";
        stockAvailable = true;
        featured = false;
      },
      {
        id = 6;
        name = "Ibuprofen Capsules (200mg)";
        category = #medicines;
        description = "Pain reliever and anti-inflammatory. Contains 30 capsules.";
        price = 90.0;
        imageUrl = "/assets/generated/ibuprofen.jpg";
        stockAvailable = true;
        featured = false;
      },
      {
        id = 7;
        name = "Antiseptic Cream";
        category = #firstAid;
        description = "Prevents infection in minor cuts, scrapes, and burns. 20g tube.";
        price = 60.0;
        imageUrl = "/assets/generated/antiseptic.jpg";
        stockAvailable = true;
        featured = true;
      },
      {
        id = 8;
        name = "Blood Pressure Monitor";
        category = #medicalEquipment;
        description = "Fully automatic digital blood pressure monitor with large display.";
        price = 1200.0;
        imageUrl = "/assets/generated/bpmonitor.jpg";
        stockAvailable = true;
        featured = false;
      },
      {
        id = 9;
        name = "Aloe Vera Face Wash";
        category = #personalCare;
        description = "Gentle cleanser suitable for all skin types. 100ml tube.";
        price = 95.0;
        imageUrl = "/assets/generated/facewash.jpg";
        stockAvailable = true;
        featured = false;
      },
      {
        id = 10;
        name = "Calcium + Vitamin D3 Tablets";
        category = #vitaminsSupplements;
        description = "Supports bone health. Contains 60 tablets.";
        price = 250.0;
        imageUrl = "/assets/generated/calciumd3.jpg";
        stockAvailable = true;
        featured = true;
      },
      {
        id = 11;
        name = "Cough Syrup (100ml)";
        category = #medicines;
        description = "Relief for dry and productive cough. Non-drowsy formula.";
        price = 80.0;
        imageUrl = "/assets/generated/coughsyrup.jpg";
        stockAvailable = true;
        featured = false;
      },
      {
        id = 12;
        name = "Emergency First Aid Kit";
        category = #firstAid;
        description = "Comprehensive kit with bandages, antiseptics, and basic medical tools.";
        price = 600.0;
        imageUrl = "/assets/generated/firstaidkit.jpg";
        stockAvailable = true;
        featured = true;
      },
      {
        id = 13;
        name = "Nebulizer Machine";
        category = #medicalEquipment;
        description = "Suitable for respiratory care at home. Compact and lightweight.";
        price = 1500.0;
        imageUrl = "/assets/generated/nebulizer.jpg";
        stockAvailable = true;
        featured = false;
      },
      {
        id = 14;
        name = "Sunscreen Lotion (SPF 50)";
        category = #personalCare;
        description = "Broad-spectrum sun protection, water-resistant. 100g tube.";
        price = 180.0;
        imageUrl = "/assets/generated/sunscreen.jpg";
        stockAvailable = true;
        featured = true;
      },
      {
        id = 15;
        name = "Multivitamin Tablets";
        category = #vitaminsSupplements;
        description = "For overall health and wellness. 30 tablets per bottle.";
        price = 160.0;
        imageUrl = "/assets/generated/multivitamin.jpg";
        stockAvailable = true;
        featured = false;
      },
      {
        id = 16;
        name = "Immunity Booster Syrup (200ml)";
        category = #vitaminsSupplements;
        description = "Natural ingredients to support immune function for all ages.";
        price = 220.0;
        imageUrl = "/assets/generated/immunitysyrup.jpg";
        stockAvailable = true;
        featured = true;
      },
    ];

    for (product in initialProducts.values()) {
      addProduct(product);
    };
  };

  public shared ({ caller }) func initialize() : async () {
    seedProducts();
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    products.values().toArray();
  };

  public query ({ caller }) func getProductsByCategory(category : Category) : async [Product] {
    let filtered = List.empty<Product>();
    for ((_, product) in products.entries()) {
      if (product.category == category) {
        filtered.add(product);
      };
    };
    filtered.toArray();
  };

  public query ({ caller }) func getFeaturedProducts() : async [Product] {
    let filtered = List.empty<Product>();
    for ((_, product) in products.entries()) {
      if (product.featured) {
        filtered.add(product);
      };
    };
    filtered.toArray();
  };

  public query ({ caller }) func getProductById(id : Nat) : async ?Product {
    products.get(id);
  };

  public query ({ caller }) func searchProducts(searchTerm : Text) : async [Product] {
    if (searchTerm.size() == 0) {
      return products.values().toArray();
    };

    let searchTermLower = searchTerm.toLower();
    let filtered = List.empty<Product>();

    for ((_, product) in products.entries()) {
      let nameLower = product.name.toLower();
      let descLower = product.description.toLower();
      let categoryText = Category.toText(product.category).toLower();

      if (
        nameLower.contains(#text searchTermLower) or
        descLower.contains(#text searchTermLower) or
        categoryText.contains(#text searchTermLower)
      ) {
        filtered.add(product);
      };
    };
    filtered.toArray();
  };

  public shared ({ caller }) func placeOrder(request : PlaceOrderRequest) : async PlaceOrderResponse {
    if (request.customerName.size() == 0) {
      Runtime.trap("Customer name is required");
    };

    if (request.phoneNumber.size() == 0) {
      Runtime.trap("Phone number is required");
    };

    if (request.address.line1.size() == 0 or request.address.city.size() == 0) {
      Runtime.trap("Delivery address is required");
    };

    if (request.items.size() == 0) {
      Runtime.trap("Order must contain at least one item");
    };

    var totalPrice : Float = 0.0;
    for (item in request.items.values()) {
      let optProduct = products.get(item.productId);
      switch (optProduct) {
        case (null) {
          Runtime.trap("Invalid product ID: " # item.productId.toText());
        };
        case (?product) {
          if (not product.stockAvailable) {
            Runtime.trap("Product " # product.name # " is out of stock");
          };
          totalPrice += product.price * item.quantity.toInt().toFloat();
        };
      };
    };

    let timestamp = Time.now();
    let newOrder : Order = {
      orderId = nextOrderId;
      timestamp;
      customerName = request.customerName;
      phoneNumber = request.phoneNumber;
      address = request.address;
      prescriptionNote = request.prescriptionNote;
      items = request.items;
      totalPrice;
      paymentStatus = #awaitingVerification;
      transactionId = null;
    };

    orders.add(nextOrderId, newOrder);

    let response : PlaceOrderResponse = {
      orderId = nextOrderId;
      timestamp;
      totalPrice;
    };

    nextOrderId += 1;
    response;
  };

  public query ({ caller }) func getOrder(orderId : Nat) : async ?Order {
    orders.get(orderId);
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    orders.values().toArray();
  };

  public query ({ caller }) func getOrdersByPhoneNumber(phoneNumber : Text) : async [Order] {
    let filtered = List.empty<Order>();
    for ((_, order) in orders.entries()) {
      if (order.phoneNumber == phoneNumber) {
        filtered.add(order);
      };
    };
    filtered.toArray();
  };

  public shared ({ caller }) func clearAllData() : async () {
    products.clear();
    orders.clear();
    nextProductId := 1;
    nextOrderId := 1;
    seedProducts();
  };

  public shared ({ caller }) func submitPaymentProof(orderId : Nat, transactionId : Text) : async () {
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder = { order with transactionId = ?transactionId; paymentStatus = #awaitingVerification };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  public shared ({ caller }) func confirmPayment(orderId : Nat) : async () {
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder = { order with paymentStatus = #paymentConfirmed };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  public shared ({ caller }) func rejectPayment(orderId : Nat) : async () {
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder = { order with paymentStatus = #rejected };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  public query ({ caller }) func getPendingPaymentOrders() : async [Order] {
    let filtered = List.empty<Order>();
    for ((_, order) in orders.entries()) {
      switch (order.paymentStatus) {
        case (#awaitingVerification) {
          filtered.add(order);
        };
        case (_) {};
      };
    };
    filtered.toArray();
  };

  public query ({ caller }) func getConfirmedOrders() : async [Order] {
    let filtered = List.empty<Order>();
    for ((_, order) in orders.entries()) {
      switch (order.paymentStatus) {
        case (#paymentConfirmed) {
          filtered.add(order);
        };
        case (_) {};
      };
    };
    filtered.toArray();
  };
};
