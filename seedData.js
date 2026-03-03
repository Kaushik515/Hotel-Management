import dotenv from "dotenv";
import mongoose from "mongoose";
import Hotel from "./models/Hotel.js";
import Room from "./models/Room.js";

dotenv.config();

const connect = async () => {
  mongoose.set("strictQuery", true);
  await mongoose.connect(process.env.MONGO);
};

const fixMissingImageReferences = async () => {
  const hotels = await Hotel.find({ photos: "/images/hotel.jpg" });

  for (const hotel of hotels) {
    hotel.photos = (hotel.photos || []).map((photo) =>
      photo === "/images/hotel.jpg" ? "/images/luxury-room1.jpg" : photo
    );
    await hotel.save();
  }

  if (hotels.length > 0) {
    console.log(`Updated ${hotels.length} hotel(s) with valid image paths.`);
  }
};

const createHotelWithRooms = async (hotelPayload, roomPayloads) => {
  const existingHotel = await Hotel.findOne({
    name: hotelPayload.name,
    city: hotelPayload.city,
  });

  if (existingHotel) {
    console.log(`Skipped existing hotel: ${hotelPayload.name} (${hotelPayload.city})`);
    return;
  }

  const createdRooms = [];
  for (const roomPayload of roomPayloads) {
    const room = new Room(roomPayload);
    const savedRoom = await room.save();
    createdRooms.push(savedRoom._id.toString());
  }

  const hotel = new Hotel({
    ...hotelPayload,
    rooms: createdRooms,
  });

  await hotel.save();
  console.log(`Created hotel: ${hotelPayload.name} (${hotelPayload.city})`);
};

const buildRoomPayloads = (basePrice, roomSeed) => {
  const standardRoomNumber = 100 + roomSeed * 10;
  const deluxeRoomNumber = 200 + roomSeed * 10;

  return [
    {
      title: "Standard Room",
      price: basePrice,
      maxPeople: 2,
      desc: "Comfortable room with essential amenities.",
      roomNumbers: [
        { number: standardRoomNumber + 1, unavailableDates: [] },
        { number: standardRoomNumber + 2, unavailableDates: [] },
      ],
    },
    {
      title: "Deluxe Room",
      price: basePrice + 1200,
      maxPeople: 4,
      desc: "Larger room with premium comfort and balcony view.",
      roomNumbers: [
        { number: deluxeRoomNumber + 1, unavailableDates: [] },
        { number: deluxeRoomNumber + 2, unavailableDates: [] },
      ],
    },
  ];
};

const run = async () => {
  try {
    await connect();
    await fixMissingImageReferences();

    const seedHotels = [
      { name: "Goa Seaside Resort", type: "resort", city: "Goa", address: "Calangute Beach Road, Goa", distance: "450", photos: ["/images/resort.jpg", "/images/luxury-room1.jpg", "/images/luxury-room2.jpg"], title: "Beachfront stay with sunset view", desc: "Comfortable resort near the beach with pool, wifi and breakfast.", rating: 4.5, cheapestPrice: 3200, featured: true },
      { name: "Goa City Hotel", type: "hotel", city: "Goa", address: "Panjim Central, Goa", distance: "900", photos: ["/images/luxury-room1.jpg", "/images/luxury-room3.jpg"], title: "Central location and easy transport", desc: "Modern city hotel with quick access to attractions.", rating: 4.1, cheapestPrice: 2400, featured: true },
      { name: "Goa Palm Villas", type: "villa", city: "Goa", address: "Candolim, Goa", distance: "1200", photos: ["/images/villa.jpg", "/images/luxury-room4.jpg"], title: "Private villa stay with pool", desc: "Premium villa stay suitable for families and groups.", rating: 4.4, cheapestPrice: 5600, featured: false },

      { name: "Hyderabad Grand Hotel", type: "hotel", city: "Hyderabad", address: "Banjara Hills, Hyderabad", distance: "700", photos: ["/images/luxury-room2.jpg", "/images/luxury-room3.jpg"], title: "Business and leisure comfort", desc: "Well-connected hotel near restaurants and offices.", rating: 4.2, cheapestPrice: 2900, featured: true },
      { name: "Hyderabad Residency", type: "apartment", city: "Hyderabad", address: "Gachibowli, Hyderabad", distance: "1500", photos: ["/images/apartment.jpg", "/images/luxury-room1.jpg"], title: "Apartment-style city stay", desc: "Spacious apartment suites with kitchen and wifi.", rating: 4.0, cheapestPrice: 2600, featured: false },
      { name: "Hyderabad Skyline Resort", type: "resort", city: "Hyderabad", address: "Shamirpet, Hyderabad", distance: "3500", photos: ["/images/resort.jpg", "/images/luxury-room4.jpg"], title: "Weekend resort with garden views", desc: "Relaxed resort perfect for short city escapes.", rating: 4.3, cheapestPrice: 3800, featured: false },

      { name: "Mumbai Harbour View", type: "hotel", city: "Mumbai", address: "Colaba, Mumbai", distance: "500", photos: ["/images/luxury-room3.jpg", "/images/luxury-room2.jpg"], title: "Harbour-side premium stay", desc: "Luxury stay near major city landmarks.", rating: 4.6, cheapestPrice: 6100, featured: true },
      { name: "Mumbai Urban Suites", type: "apartment", city: "Mumbai", address: "Andheri East, Mumbai", distance: "2200", photos: ["/images/apartment.jpg", "/images/luxury-room1.jpg"], title: "Modern apartment suites", desc: "Smart apartment stays with city access.", rating: 4.1, cheapestPrice: 4200, featured: false },
      { name: "Mumbai Coastal Resort", type: "resort", city: "Mumbai", address: "Madh Island, Mumbai", distance: "4800", photos: ["/images/resort.jpg", "/images/luxury-room4.jpg"], title: "Resort near the coast", desc: "Calm resort atmosphere with pool and gardens.", rating: 4.2, cheapestPrice: 5300, featured: false },

      { name: "Delhi Imperial Stay", type: "hotel", city: "Delhi", address: "Connaught Place, Delhi", distance: "600", photos: ["/images/luxury-room2.jpg", "/images/luxury-room3.jpg"], title: "Central Delhi premium hotel", desc: "Upscale stay in the heart of Delhi.", rating: 4.4, cheapestPrice: 4800, featured: true },
      { name: "Delhi Metro Residency", type: "apartment", city: "Delhi", address: "Karol Bagh, Delhi", distance: "1300", photos: ["/images/apartment.jpg", "/images/luxury-room1.jpg"], title: "Convenient metro-connected stay", desc: "Comfortable rooms close to metro and markets.", rating: 3.9, cheapestPrice: 2500, featured: false },
      { name: "Delhi Garden Villas", type: "villa", city: "Delhi", address: "Chattarpur, Delhi", distance: "4200", photos: ["/images/villa.jpg", "/images/luxury-room4.jpg"], title: "Quiet villa retreat", desc: "Spacious villa stay with private lawns.", rating: 4.1, cheapestPrice: 5400, featured: false },

      { name: "Bangalore Tech Park Hotel", type: "hotel", city: "Bangalore", address: "Whitefield, Bangalore", distance: "1800", photos: ["/images/luxury-room2.jpg", "/images/luxury-room3.jpg"], title: "Ideal for business travel", desc: "Hotel close to tech parks and offices.", rating: 4.2, cheapestPrice: 3600, featured: true },
      { name: "Bangalore Green Apartments", type: "apartment", city: "Bangalore", address: "Indiranagar, Bangalore", distance: "1400", photos: ["/images/apartment.jpg", "/images/luxury-room1.jpg"], title: "Serviced apartments in city center", desc: "Great for long stay and families.", rating: 4.0, cheapestPrice: 3000, featured: false },

      { name: "Chennai Marina Hotel", type: "hotel", city: "Chennai", address: "Marina Beach Road, Chennai", distance: "900", photos: ["/images/luxury-room3.jpg", "/images/luxury-room2.jpg"], title: "Seaside business hotel", desc: "Comfortable stay near major city routes.", rating: 4.1, cheapestPrice: 3300, featured: false },
      { name: "Chennai Bay Resort", type: "resort", city: "Chennai", address: "ECR, Chennai", distance: "4200", photos: ["/images/resort.jpg", "/images/luxury-room4.jpg"], title: "Resort on East Coast Road", desc: "Popular weekend getaway resort.", rating: 4.3, cheapestPrice: 4700, featured: false },

      { name: "Jaipur Palace Hotel", type: "hotel", city: "Jaipur", address: "MI Road, Jaipur", distance: "1100", photos: ["/images/luxury-room3.jpg", "/images/luxury-room1.jpg"], title: "Royal style city hotel", desc: "Traditional hospitality with modern amenities.", rating: 4.3, cheapestPrice: 3500, featured: false },
      { name: "Jaipur Heritage Villas", type: "villa", city: "Jaipur", address: "Amer Road, Jaipur", distance: "3000", photos: ["/images/villa.jpg", "/images/luxury-room4.jpg"], title: "Heritage villa experience", desc: "Elegant villa stay with heritage decor.", rating: 4.4, cheapestPrice: 5900, featured: false },

      { name: "Kolkata Riverfront Hotel", type: "hotel", city: "Kolkata", address: "Howrah Riverside, Kolkata", distance: "1400", photos: ["/images/luxury-room2.jpg", "/images/luxury-room3.jpg"], title: "Riverfront business stay", desc: "Comfort hotel near transport and riverfront.", rating: 4.0, cheapestPrice: 2800, featured: false },
      { name: "Kolkata Central Apartments", type: "apartment", city: "Kolkata", address: "Park Street, Kolkata", distance: "900", photos: ["/images/apartment.jpg", "/images/luxury-room1.jpg"], title: "Central serviced apartment", desc: "City-center apartment with amenities.", rating: 3.8, cheapestPrice: 2400, featured: false },

      { name: "Manali Mountain Resort", type: "resort", city: "Manali", address: "Old Manali Road, Manali", distance: "2200", photos: ["/images/resort.jpg", "/images/cabins.jpg"], title: "Mountain view resort", desc: "Popular stay with valley-facing rooms.", rating: 4.6, cheapestPrice: 4300, featured: true },
      { name: "Manali Snow Cabins", type: "cabin", city: "Manali", address: "Solang Valley, Manali", distance: "5200", photos: ["/images/cabins.jpg", "/images/luxury-room4.jpg"], title: "Cabin stay in snowy hills", desc: "Wooden cabins with scenic surroundings.", rating: 4.5, cheapestPrice: 3900, featured: true },

      { name: "Kochi Waterfront Hotel", type: "hotel", city: "Kochi", address: "Marine Drive, Kochi", distance: "1000", photos: ["/images/luxury-room2.jpg", "/images/luxury-room3.jpg"], title: "Waterfront city hotel", desc: "Comfortable hotel near major attractions.", rating: 4.1, cheapestPrice: 3100, featured: false },
      { name: "Kochi Backwater Villas", type: "villa", city: "Kochi", address: "Fort Kochi, Kochi", distance: "2600", photos: ["/images/villa.jpg", "/images/luxury-room1.jpg"], title: "Backwater villa stay", desc: "Relaxed villas near the coastline.", rating: 4.2, cheapestPrice: 5200, featured: false },
    ];

    for (let index = 0; index < seedHotels.length; index += 1) {
      const hotel = seedHotels[index];
      await createHotelWithRooms(hotel, buildRoomPayloads(hotel.cheapestPrice, index + 1));
    }

    console.log("Seeding finished.");
  } catch (err) {
    console.error("Seeding failed:", err.message);
  } finally {
    await mongoose.connection.close();
  }
};

run();
