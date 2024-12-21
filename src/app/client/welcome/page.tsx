
// /app/client/welcome/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as SelectPrimitive from "@radix-ui/react-select";
import { motion } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";
import Loading from "@/components/Loading";
import { AlertModal } from "@/components/AlertModal";

export default function WelcomePage() {
    const [checkInDate, setCheckInDate] = useState("");
    const [checkOutDate, setCheckOutDate] = useState("");
    const [numGuests, setNumGuests] = useState("1");
    const [isLoading, setIsLoading] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const router = useRouter();

    const handleQuickBook = () => {
        // Validate that Check-Out is after Check-In
        if (checkInDate && checkOutDate && numGuests) {
            const checkIn = new Date(checkInDate);
            const checkOut = new Date(checkOutDate);
            if (checkOut <= checkIn) {
                setAlertMessage("Check-Out date must be after Check-In date.");
                setIsAlertOpen(true);
                return;
            }
            setIsLoading(true);
            router.push(
                `/client/room-booking-calendar?checkIn=${checkInDate}&checkOut=${checkOutDate}&numGuests=${numGuests}`
            );
        } else {
            setAlertMessage("Please fill in all fields for booking.");
            setIsAlertOpen(true);
        }
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Fixed Navigation Bar */}
            <nav className="fixed top-0 left-0 right-0 bg-transparent z-50">
                <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-white">Casa Lili</h1>
                    <div className="flex space-x-4">
                        <a href="#home" className="text-white hover:text-[#8B2500] transition-colors duration-200">
                            Home
                        </a>
                        <a href="#about" className="text-white hover:text-[#8B2500] transition-colors duration-200">
                            About
                        </a>
                        <a href="#amenities" className="text-white hover:text-[#8B2500] transition-colors duration-200">
                            Amenities
                        </a>
                        <a href="#testimonials" className="text-white hover:text-[#8B2500] transition-colors duration-200">
                            Testimonials
                        </a>
                        <a href="#gallery" className="text-white hover:text-[#8B2500] transition-colors duration-200">
                            Gallery
                        </a>
                    </div>
                </div>
            </nav>

            {/* Hero Section with Booking Bar */}
            <section
                id="home"
                className="relative h-[60vh] bg-cover bg-center"
                style={{ backgroundImage: "url('/images/hotel-exterior.png')" }}
            >
                <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-white px-4">
                    <motion.h1
                        className="text-5xl font-bold mb-4 text-white"
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                    >
                        Welcome to Casa Lili
                    </motion.h1>
                    <motion.p
                        className="text-2xl mb-8 text-white"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.5 }}
                    >
                        Experience comfort with a local touch
                    </motion.p>

                    {/* Booking Bar */}
                    <motion.div
                        className="bg-white p-6 rounded-lg shadow-lg flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 w-full max-w-4xl"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 1 }}
                    >
                        <Input
                            type="date"
                            value={checkInDate}
                            onChange={(e) => setCheckInDate(e.target.value)}
                            className="border-[#8B2500] w-full text-gray-700"
                            placeholder="Check-In"
                            required
                        />
                        <Input
                            type="date"
                            value={checkOutDate}
                            onChange={(e) => setCheckOutDate(e.target.value)}
                            className="border-[#8B2500] w-full text-gray-700"
                            placeholder="Check-Out"
                            required
                        />
                        <SelectPrimitive.Root value={numGuests} onValueChange={setNumGuests}>
                            <SelectPrimitive.Trigger
                                className="border border-[#8B2500] rounded-md px-3 py-2 text-gray-700 w-full md:w-auto flex items-center justify-between"
                                aria-label="Number of Guests"
                            >
                                <SelectPrimitive.Value placeholder={`${numGuests} Guest(s)`} />
                                <SelectPrimitive.Icon>
                                    <FiChevronDown className="w-5 h-5 text-gray-700" />
                                </SelectPrimitive.Icon>
                            </SelectPrimitive.Trigger>
                            <SelectPrimitive.Content className="bg-white border border-[#8B2500] rounded-md shadow-lg mt-1">
                                <SelectPrimitive.Viewport className="p-1">
                                    {[1, 2, 3, 4, 5, 6].map((num) => (
                                        <SelectPrimitive.Item
                                            key={num}
                                            value={num.toString()}
                                            className="px-4 py-2 text-gray-700 cursor-pointer hover:bg-[#8B2500] hover:text-white rounded-md"
                                        >
                                            <SelectPrimitive.ItemText>
                                                {num} Guest{num > 1 ? "s" : ""}
                                            </SelectPrimitive.ItemText>
                                        </SelectPrimitive.Item>
                                    ))}
                                </SelectPrimitive.Viewport>
                            </SelectPrimitive.Content>
                        </SelectPrimitive.Root>
                        <Button
                            className="bg-[#8B2500] hover:bg-[#5E3023] text-white w-full md:w-auto px-8 py-4 text-lg font-semibold transition-colors duration-200"
                            onClick={handleQuickBook}
                        >
                            Quick Book
                        </Button>
                    </motion.div>
                </div>
            </section>

            {/* About Us Section */}
            <section id="about" className="py-16 bg-[#F7EDE2]">
                <div className="max-w-6xl mx-auto px-4">
                    <motion.h2
                        className="text-4xl font-bold text-[#5E3023] mb-8 text-center"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                    >
                        About Casa Lili
                    </motion.h2>
                    <motion.p
                        className="text-lg text-gray-700 leading-relaxed text-center max-w-3xl mx-auto"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                    >
                        Nestled in the historical center of Tunja, just next to the main square and colonial churches, Casa Lili offers a serene retreat with a blend of modern comforts and traditional charm. Our mission is to provide guests with an unforgettable experience, ensuring every stay is marked by relaxation, luxury, and personalized service.
                    </motion.p>
                </div>
            </section>

            {/* Amenities Section */}
            <section id="amenities" className="py-16">
                <div className="max-w-6xl mx-auto px-4">
                    <motion.h2
                        className="text-4xl font-bold text-[#5E3023] mb-8 text-center"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                    >
                        Our Amenities
                    </motion.h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Amenity 1 */}
                        <motion.div
                            className="flex flex-col items-center text-center"
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.3 }}
                        >
                            <Image src="/images/amenity-wifi.png" alt="Free Wi-Fi" width={100} height={100} />
                            <h3 className="text-2xl font-semibold text-[#5E3023] mt-4">Free Wi-Fi</h3>
                            <p className="text-gray-700 mt-2">
                                Stay connected with our high-speed internet access available throughout the property.
                            </p>
                        </motion.div>
                        {/* Amenity 2 */}
                        <motion.div
                            className="flex flex-col items-center text-center"
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.5 }}
                        >
                            <Image src="/images/amenity-laundry.png" alt="Laundry Service" width={100} height={100} />
                            <h3 className="text-2xl font-semibold text-[#5E3023] mt-4">Laundry Service</h3>
                            <p className="text-gray-700 mt-2">
                                Enjoy the convenience of our on-site laundry service, ensuring a hassle-free stay.
                            </p>
                        </motion.div>
                        {/* Amenity 3 */}
                        <motion.div
                            className="flex flex-col items-center text-center"
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.7 }}
                        >
                            <Image src="/images/amenity-breakfast.png" alt="Breakfast Included" width={100} height={100} />
                            <h3 className="text-2xl font-semibold text-[#5E3023] mt-4">Breakfast Included</h3>
                            <p className="text-gray-700 mt-2">
                                Start your day with a delicious complimentary breakfast featuring a variety of options.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-16 bg-[#F7EDE2]">
                <div className="max-w-6xl mx-auto px-4">
                    <motion.h2
                        className="text-4xl font-bold text-[#5E3023] mb-8 text-center"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                    >
                        What Our Guests Say
                    </motion.h2>
                    <div className="space-y-8">
                        {/* Testimonial 1 */}
                        <motion.div
                            className="bg-white p-6 rounded-lg shadow-lg"
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.3 }}
                        >
                            <p className="text-gray-700 mb-4">
                                "Casa Lili was an absolute delight! The staff were incredibly friendly and the rooms were spotless. Highly recommend!"
                            </p>
                            <h4 className="text-xl font-semibold text-[#5E3023]">- Maria S.</h4>
                        </motion.div>
                        {/* Testimonial 2 */}
                        <motion.div
                            className="bg-white p-6 rounded-lg shadow-lg"
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.5 }}
                        >
                            <p className="text-gray-700 mb-4">
                                "The amenities at Casa Lili exceeded my expectations. The pool area was perfect for relaxing after a long day."
                            </p>
                            <h4 className="text-xl font-semibold text-[#5E3023]">- Juan P.</h4>
                        </motion.div>
                        {/* Testimonial 3 */}
                        <motion.div
                            className="bg-white p-6 rounded-lg shadow-lg"
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.7 }}
                        >
                            <p className="text-gray-700 mb-4">
                                "Loved the location of Casa Lili! It was close to all the main attractions and the breakfast was fantastic."
                            </p>
                            <h4 className="text-xl font-semibold text-[#5E3023]">- Laura M.</h4>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Gallery Section */}
            <section id="gallery" className="py-16">
                <div className="max-w-6xl mx-auto px-4">
                    <motion.h2
                        className="text-4xl font-bold text-[#5E3023] mb-8 text-center"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                    >
                        Our Gallery
                    </motion.h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {/* Gallery Image 1 */}
                        <motion.div
                            className="relative h-48 rounded-lg overflow-hidden"
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <Image
                                src="/images/facade.jpg"
                                alt="Lobby Area"
                                fill
                                style={{ objectFit: "cover" }}
                                className="hover:scale-110 transition-transform duration-300"
                            />
                        </motion.div>
                        {/* Gallery Image 2 */}
                        <motion.div
                            className="relative h-48 rounded-lg overflow-hidden"
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                        >
                            <Image
                                src="/images/corridors.jpg"
                                alt="Corridors"
                                fill
                                style={{ objectFit: "cover" }}
                                className="hover:scale-110 transition-transform duration-300"
                            />
                        </motion.div>
                        {/* Gallery Image 3 */}
                        <motion.div
                            className="relative h-48 rounded-lg overflow-hidden"
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.7 }}
                        >
                            <Image
                                src="/images/restaurant.jpg"
                                alt="Restaurant"
                                fill
                                style={{ objectFit: "cover" }}
                                className="hover:scale-110 transition-transform duration-300"
                            />
                        </motion.div>
                        {/* Add more images as needed */}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#5E3023] text-white py-8">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center px-4">
                    <div className="text-center md:text-left mb-4 md:mb-0">
                        <h3 className="text-2xl font-bold mb-2">Casa Lili</h3>
                        <p>Calle 22 #9-66, Tunja, Colombia</p>
                        <p>Phone: +57 1 234 5678</p>
                    </div>
                    <div className="text-center md:text-left">
                        <h4 className="text-xl font-semibold mb-2">Quick Links</h4>
                        <div className="flex flex-col md:flex-row md:space-x-4">
                            <Button variant="link" className="text-white hover:underline">
                                About Us
                            </Button>
                            <Button variant="link" className="text-white hover:underline">
                                Contact
                            </Button>
                            <Button variant="link" className="text-white hover:underline">
                                Privacy Policy
                            </Button>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Back to Top Button */}
            <Button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="fixed bottom-6 right-6 bg-[#8B2500] hover:bg-[#5E3023] text-white p-3 rounded-full shadow-lg transition-colors duration-200"
                aria-label="Back to Top"
            >
                ↑
            </Button>

            {/* Alert Modal */}
            <AlertModal
                isOpen={isAlertOpen}
                title="Booking Error"
                message={alertMessage}
                onClose={() => setIsAlertOpen(false)}
            />
        </div>
    );
}
