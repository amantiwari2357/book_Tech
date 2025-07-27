require('dotenv').config();
const mongoose = require('mongoose');
const BookDesign = require('./models/BookDesign');
const User = require('./models/User');

async function seedTestBookDesigns() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Find or create a test author
    let testAuthor = await User.findOne({ email: 'testauthor@example.com' });
    if (!testAuthor) {
      testAuthor = await User.create({
        name: 'Test Author',
        email: 'testauthor@example.com',
        password: 'password123',
        role: 'author'
      });
      console.log('Created test author');
    }

    // Create test book designs with pending status
    const testBookDesigns = [
      {
        title: 'The Digital Revolution',
        author: 'Test Author',
        description: 'A comprehensive guide to understanding the digital transformation of our society.',
        coverImageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
        content: `Chapter 1: The Beginning of Digital Era

The digital revolution began in the late 20th century and has transformed every aspect of our lives. From the way we communicate to how we work, learn, and entertain ourselves, technology has become an integral part of our daily existence.

In this book, we will explore the various facets of this transformation, examining both its benefits and challenges. We'll look at how digital technology has changed industries, created new opportunities, and presented new challenges for individuals and organizations alike.

The pace of change has been unprecedented. What took decades to develop in previous industrial revolutions now happens in years or even months. This rapid evolution has created both excitement and anxiety as we navigate the complexities of a digital-first world.

Chapter 2: Understanding Digital Transformation

Digital transformation is not just about adopting new technologies; it's about fundamentally changing how organizations operate and deliver value to their customers. It involves rethinking business models, processes, and customer experiences in the context of digital technology.

Key aspects of digital transformation include:
- Automation of manual processes
- Data-driven decision making
- Enhanced customer experiences
- New business models and revenue streams
- Improved operational efficiency

The success of digital transformation depends not only on technology but also on organizational culture, leadership, and change management. Organizations must be willing to experiment, learn from failures, and continuously adapt to changing circumstances.

Chapter 3: The Future of Work

As we move further into the digital age, the nature of work is changing dramatically. Remote work, automation, artificial intelligence, and the gig economy are reshaping traditional employment models.

Key trends include:
- Increased remote and flexible work arrangements
- Automation of routine tasks
- Growing demand for digital skills
- New forms of collaboration and communication
- Evolving career paths and job security

Workers must adapt to these changes by developing new skills, embracing lifelong learning, and maintaining flexibility in their career planning. Organizations must also adapt their management practices and workplace policies to accommodate these new realities.

The digital revolution is ongoing, and its full impact is yet to be realized. By understanding these changes and preparing for them, we can better navigate the challenges and opportunities that lie ahead.`,
        formatting: {
          fontSize: 16,
          fontFamily: 'Times New Roman',
          lineHeight: 1.6,
          textColor: '#2c3e50',
          backgroundColor: '#f8f9fa',
          pageWidth: 5.5,
          pageHeight: 8.5,
          margins: {
            top: 0.5,
            bottom: 0.5,
            left: 0.75,
            right: 0.75
          }
        },
        category: 'Technology',
        tags: ['digital', 'technology', 'transformation'],
        isFree: false,
        price: 14.99,
        isPremium: false,
        status: 'pending',
        authorRef: testAuthor._id
      },
      {
        title: 'Creative Writing Workshop',
        author: 'Test Author',
        description: 'A practical guide to developing your creative writing skills and finding your unique voice.',
        coverImageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400',
        content: `Introduction: Finding Your Voice

Every writer has a unique voice waiting to be discovered. This book is designed to help you find and develop yours through practical exercises, examples, and guidance from experienced writers.

Writing is both an art and a craft. While natural talent plays a role, the skills of writing can be learned and improved through practice, study, and reflection. This workshop-style book will guide you through the process of becoming a better writer.

Chapter 1: The Fundamentals of Good Writing

Good writing begins with understanding the basics. Clear communication, proper grammar, and effective structure form the foundation upon which creative expression is built.

Key principles include:
- Clarity and precision in language
- Strong opening hooks
- Logical organization and flow
- Varied sentence structure
- Appropriate tone and style

Remember that rules exist to serve communication, not to stifle creativity. Once you understand the fundamentals, you can bend and break rules intentionally for artistic effect.

Chapter 2: Developing Characters

Characters are the heart of any story. Whether you're writing fiction, memoir, or even business content, creating compelling characters will engage your readers and drive your narrative forward.

Techniques for character development:
- Create detailed character profiles
- Show character through action and dialogue
- Develop internal and external conflicts
- Allow characters to grow and change
- Make characters relatable yet unique

Great characters feel real to readers because they have depth, complexity, and internal contradictions. They make choices that reveal their values and drive the plot forward.

Chapter 3: Building Your Writing Practice

Consistency is key to developing as a writer. Establishing a regular writing practice will help you improve your skills and maintain momentum on your projects.

Tips for building a writing practice:
- Set aside dedicated writing time
- Create a comfortable writing space
- Keep a notebook for ideas and observations
- Read widely and analytically
- Join writing groups or workshops
- Accept that first drafts are imperfect

The goal is progress, not perfection. Every word you write brings you closer to becoming the writer you want to be.

Conclusion: Your Writing Journey

Writing is a lifelong journey of discovery and growth. Each piece you write teaches you something new about your craft and yourself. Embrace the process, celebrate your progress, and keep writing.`,
        formatting: {
          fontSize: 14,
          fontFamily: 'Georgia',
          lineHeight: 1.8,
          textColor: '#1a1a1a',
          backgroundColor: '#ffffff',
          pageWidth: 5.5,
          pageHeight: 8.5,
          margins: {
            top: 0.5,
            bottom: 0.5,
            left: 0.75,
            right: 0.75
          }
        },
        category: 'Writing',
        tags: ['writing', 'creativity', 'workshop'],
        isFree: true,
        price: 0,
        isPremium: false,
        status: 'pending',
        authorRef: testAuthor._id
      },
      {
        title: 'Mindful Living in the Modern World',
        author: 'Test Author',
        description: 'Practical strategies for maintaining mindfulness and balance in our fast-paced digital age.',
        coverImageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
        content: `Preface: The Need for Mindfulness

In our hyperconnected world, finding moments of peace and presence has become more challenging than ever. This book offers practical strategies for cultivating mindfulness in everyday life, helping readers navigate the complexities of modern existence with greater awareness and balance.

The pace of modern life often leaves us feeling overwhelmed, disconnected, and stressed. Mindfulness offers a way to reconnect with ourselves and the present moment, creating space for clarity, creativity, and joy.

Chapter 1: Understanding Mindfulness

Mindfulness is the practice of paying attention to the present moment with openness, curiosity, and acceptance. It's not about emptying the mind or achieving a particular state, but rather about being fully present to whatever is happening right now.

Core principles of mindfulness:
- Present-moment awareness
- Non-judgmental observation
- Acceptance of what is
- Compassion for self and others
- Intentional attention

Mindfulness is not a quick fix or escape from reality. Instead, it's a way of relating to experience that can transform how we understand ourselves and the world around us.

Chapter 2: Daily Mindfulness Practices

Integrating mindfulness into daily life doesn't require hours of meditation or dramatic lifestyle changes. Simple practices can be woven into existing routines to create moments of awareness throughout the day.

Practical exercises include:
- Mindful breathing exercises
- Body scan meditations
- Walking meditation
- Mindful eating practices
- Gratitude journaling
- Digital detox periods

The key is consistency rather than duration. Even five minutes of mindful practice each day can create significant positive changes in how we experience life.

Chapter 3: Mindfulness in Relationships

Mindful communication and presence can transform our relationships with others. By bringing full attention to our interactions, we can deepen connections, resolve conflicts more effectively, and create more meaningful relationships.

Key practices for mindful relationships:
- Active listening without interruption
- Speaking with intention and care
- Recognizing and managing emotional triggers
- Practicing empathy and compassion
- Setting healthy boundaries
- Expressing gratitude and appreciation

Mindful relationships require ongoing practice and patience. The benefits include deeper connections, better communication, and greater emotional intelligence.

Chapter 4: Mindfulness at Work

The workplace is often a source of stress and overwhelm. Mindfulness practices can help us navigate work challenges with greater clarity, creativity, and resilience.

Workplace mindfulness strategies:
- Mindful transitions between tasks
- Conscious breathing during stressful moments
- Mindful breaks and rest periods
- Setting clear boundaries between work and personal time
- Practicing gratitude for work opportunities
- Mindful communication with colleagues

Mindfulness at work doesn't mean being passive or avoiding challenges. Instead, it helps us respond to situations with greater wisdom and effectiveness.

Conclusion: Living Mindfully

Mindfulness is not a destination but a way of traveling through life. It's a practice that deepens over time, offering greater clarity, peace, and joy in all aspects of our existence.

The journey of mindfulness is unique for each person. What matters most is the intention to be present and the willingness to begin again, moment by moment.`,
        formatting: {
          fontSize: 15,
          fontFamily: 'Arial',
          lineHeight: 1.7,
          textColor: '#333333',
          backgroundColor: '#fafafa',
          pageWidth: 5.5,
          pageHeight: 8.5,
          margins: {
            top: 0.5,
            bottom: 0.5,
            left: 0.75,
            right: 0.75
          }
        },
        category: 'Self-Help',
        tags: ['mindfulness', 'wellness', 'meditation'],
        isFree: false,
        price: 11.99,
        isPremium: false,
        status: 'pending',
        authorRef: testAuthor._id
      }
    ];

    // Clear existing pending book designs
    await BookDesign.deleteMany({ status: 'pending' });
    console.log('Cleared existing pending book designs');

    // Insert test book designs
    const createdDesigns = await BookDesign.insertMany(testBookDesigns);
    console.log(`Created ${createdDesigns.length} test book designs with pending status`);

    console.log('Test book designs created successfully!');
    console.log('You can now test the admin book design approval system.');
    
    // List the created designs
    createdDesigns.forEach((design, index) => {
      console.log(`${index + 1}. ${design.title} - ${design.isFree ? 'Free' : `$${design.price}`} - ${design.category}`);
    });

  } catch (error) {
    console.error('Error seeding test book designs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
seedTestBookDesigns(); 