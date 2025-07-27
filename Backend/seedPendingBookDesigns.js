require('dotenv').config();
const mongoose = require('mongoose');
const BookDesign = require('./models/BookDesign');
const User = require('./models/User');

async function seedPendingBookDesigns() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Find or create a test author
    let testAuthor = await User.findOne({ email: 'testauthor@example.com' });
    if (!testAuthor) {
      testAuthor = new User({
        name: 'Test Author',
        email: 'testauthor@example.com',
        password: 'password123',
        role: 'author'
      });
      await testAuthor.save();
      console.log('Created test author');
    }

    // Clear existing pending book designs
    await BookDesign.deleteMany({ status: 'pending' });
    console.log('Cleared existing pending book designs');

    // Create new pending book designs
    const pendingDesigns = [
      {
        title: '100acress',
        author: 'Aman Tiwari',
        description: 'Chapter 1: Naya Semester, Nayi Duniya Aarav ne engineering college ka pehla din kadam rakha. Lucknow ke ek simple se ghar se nikla tha, ab wo Delhi ke prestigious engineering college mein tha.',
        coverImageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
        content: `Chapter 1: Naya Semester, Nayi Duniya

Aarav ne engineering college ka pehla din kadam rakha. Lucknow ke ek simple se ghar se nikla tha, ab wo Delhi ke prestigious engineering college mein tha. Uski aankhon mein sapne the, dil mein jazba tha, aur dimag mein sawalon ki duniya.

"Beta, tumhare liye ye din bahut important hai," uski maa ne kaha tha station par. "Tumhara future tumhare haathon mein hai."

Aarav ne apni maa ko dekh kar muskaan di. Wo jaanta tha ki unke liye ye din kitna important tha. Ghar ki financial condition theek nahi thi, lekin unhonne uski padhai ke liye sab kuch kiya tha.

College gate par pahunchte hi Aarav ko ek naya duniya dikha. Students har taraf the - koi mobile phones use kar rahe the, koi laptops ke saath, koi groups mein baat kar rahe the. Sab modern aur confident lag rahe the.

"Kya tum bhi first year ke ho?" ek ladke ne pucha jo Aarav ke paas khada tha.

"Haan, main bhi first year ka hun," Aarav ne jawaab diya.

"Main Rahul hun. Computer Science branch se hun. Tum kis branch se ho?"

"Main bhi Computer Science se hun," Aarav ne kaha.

"Great! Chalo saath mein registration karte hain," Rahul ne kaha.

Is tarah Aarav ki college life shuru hui. Naye dost, naye challenges, aur naye opportunities. Wo jaanta tha ki ye journey aasan nahi hogi, lekin wo ready tha apne sapnon ko pura karne ke liye.

College ke first day par hi Aarav ko samajh aa gaya tha ki ab uski life mein kya kya changes aane wale hain. Wo simple Lucknow se aaya tha, ab wo Delhi ke modern environment mein adapt karna hoga.

"Kya tum bhi hostel mein rahoge?" Rahul ne pucha.

"Haan, main hostel mein hi rahunga," Aarav ne kaha.

"Main bhi hostel mein hun. Room partner ban jate hain?"

"Bilkul! Ye idea bahut accha hai," Aarav ne kaha.

Is tarah Aarav ko apna pehla dost mil gaya. College life mein doston ka hona bahut important hota hai. Wo tumhare ups and downs mein tumhare saath hote hain.

First day par hi Aarav ko samajh aa gaya tha ki engineering college mein padhai kitni challenging hogi. Professors ne syllabus explain kiya, assignments diye, aur expectations set kiye.

"Engineering mein sirf theory nahi, practical knowledge bhi important hai," ek professor ne kaha. "Tum log industry ke liye ready hona hoga."

Aarav ne apne notebook mein ye baat note kar li. Wo jaanta tha ki sirf degree lena kafi nahi hai, skills develop karni hongi.

Evening mein hostel mein wapas aate waqt Aarav ne socha ki aaj ka din kitna productive tha. Naye dost mile, nayi information mili, aur naye goals set kiye.

"Kya tum bhi future mein software engineer banna chahte ho?" Rahul ne pucha.

"Haan, main bhi software development mein career banana chahta hun," Aarav ne kaha.

"Great! Main bhi same field mein jaana chahta hun. Saath mein padhai karenge, projects banayenge."

Is tarah dono dost ne apne career goals share kiye. College life mein aise meaningful conversations bahut important hote hain.

Night ko bed par let kar Aarav ne apne din ka review kiya. Wo satisfied tha ki aaj ka din productive tha. Naye challenges aane wale the, lekin wo ready tha unka samna karne ke liye.

"Kal se regular classes shuru hongi," Aarav ne socha. "Ab real journey shuru hogi."

Is tarah Aarav ki engineering college journey shuru hui. Naye sapne, naye challenges, aur naye opportunities. Wo jaanta tha ki ye journey aasan nahi hogi, lekin wo ready tha apne goals ko achieve karne ke liye.`,
        formatting: {
          fontSize: 16,
          fontFamily: 'Times New Roman',
          lineHeight: 1.6,
          textColor: '#2c3e50',
          backgroundColor: '#f8f9fa',
          pageWidth: 5.5,
          pageHeight: 8.5,
          margins: { top: 0.5, bottom: 0.5, left: 0.75, right: 0.75 }
        },
        category: 'Fiction',
        tags: ['amam', 'fgbnjm,./'],
        isFree: false,
        price: 12.99,
        isPremium: false,
        status: 'pending',
        authorRef: testAuthor._id
      },
      {
        title: 'The Digital Revolution',
        author: 'Aman Tiwari',
        description: 'A comprehensive guide to understanding the digital transformation of our society.',
        coverImageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
        content: `Chapter 1: The Beginning of Digital Era

The digital revolution began not with a bang, but with a series of small, interconnected changes that gradually transformed our world. It started in the late 20th century when computers became more accessible to the general public, and it has been accelerating ever since.

In the early days, computers were massive machines that occupied entire rooms. They were expensive, complex, and accessible only to large corporations and government institutions. But as technology advanced, computers became smaller, faster, and more affordable.

The personal computer revolution of the 1980s marked a significant turning point. For the first time, individuals could own and use computers in their homes. This democratization of technology opened up new possibilities for creativity, communication, and productivity.

The internet, which began as a military and academic network, became available to the public in the 1990s. This development was perhaps the most transformative aspect of the digital revolution. The internet connected people across the globe, making information and communication accessible to anyone with a computer and a connection.

Email replaced traditional mail for many purposes, making communication faster and more efficient. The World Wide Web, developed by Tim Berners-Lee, made information easily accessible through a simple interface. Suddenly, anyone could publish content and reach a global audience.

The rise of social media in the early 2000s further accelerated the digital transformation. Platforms like Facebook, Twitter, and LinkedIn changed how people connect, share information, and build communities. Social media became a powerful tool for communication, marketing, and social change.

Mobile technology has been another crucial driver of the digital revolution. The introduction of smartphones in the late 2000s made computing power portable and accessible. People could now access the internet, take photos, send messages, and use applications from anywhere.

The app economy emerged as developers created millions of applications for various purposes. From productivity tools to entertainment apps, mobile applications have become an integral part of modern life. The success of app stores has created new opportunities for entrepreneurs and developers.

Cloud computing has revolutionized how businesses and individuals store and access data. Instead of relying on local storage, people can now store their files, photos, and documents in the cloud. This has made data more secure, accessible, and shareable.

Artificial intelligence and machine learning represent the latest frontier of the digital revolution. These technologies are transforming industries from healthcare to transportation. AI-powered tools can analyze vast amounts of data, make predictions, and automate complex tasks.

The digital revolution has also changed how we work. Remote work, which was once rare, has become commonplace thanks to digital tools and communication platforms. Video conferencing, cloud-based collaboration tools, and project management software have made it possible for teams to work together from anywhere in the world.

Education has been transformed by digital technology. Online learning platforms, educational apps, and digital textbooks have made education more accessible and flexible. Students can now learn at their own pace and access resources from anywhere.

The entertainment industry has been revolutionized by digital technology. Streaming services have replaced traditional television and movie distribution. Music, movies, and books are now available on-demand through digital platforms.

E-commerce has transformed retail, making it possible to shop for almost anything online. Digital payment systems have made transactions faster and more secure. The rise of online marketplaces has created new opportunities for businesses and consumers alike.

The digital revolution has also had significant social and cultural impacts. It has changed how we communicate, how we consume media, and how we form communities. Digital technology has made the world more connected, but it has also raised questions about privacy, security, and the digital divide.

As we look to the future, the digital revolution shows no signs of slowing down. Emerging technologies like virtual reality, augmented reality, and the Internet of Things promise to further transform our world. The challenge will be to harness these technologies for the benefit of humanity while addressing the challenges they present.

The digital revolution is not just about technology; it's about how technology changes human behavior, society, and culture. It's about the opportunities and challenges that come with living in an increasingly digital world.

As we continue to navigate this digital landscape, it's important to remember that technology is a tool that can be used for good or ill. The choices we make about how to use and regulate digital technology will shape the future of our society.

The digital revolution is ongoing, and its full impact is yet to be realized. But one thing is certain: the world will never be the same again.`,
        formatting: {
          fontSize: 14,
          fontFamily: 'Arial',
          lineHeight: 1.5,
          textColor: '#1a1a1a',
          backgroundColor: '#ffffff',
          pageWidth: 5.5,
          pageHeight: 8.5,
          margins: { top: 0.5, bottom: 0.5, left: 0.75, right: 0.75 }
        },
        category: 'Technology',
        tags: ['digital', 'technology', 'transformation'],
        isFree: true,
        price: 0,
        isPremium: false,
        status: 'pending',
        authorRef: testAuthor._id
      }
    ];

    for (const design of pendingDesigns) {
      const bookDesign = new BookDesign(design);
      await bookDesign.save();
      console.log(`Created pending book design: ${design.title}`);
    }

    console.log('All pending book designs have been created!');
    console.log('You can now see them in the admin dashboard for approval.');
  } catch (error) {
    console.error('Error seeding pending book designs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedPendingBookDesigns(); 