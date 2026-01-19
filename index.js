const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 3000;

// JWT Secret - In production, use a strong secret from environment variables
const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

// middleware
app.use(express.json());
app.use(cors());

// Admin verification middleware
const verifyAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: "Access denied. No token provided.",
        code: "NO_TOKEN",
      });
    }

    const token = authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: "Access denied. Invalid token format.",
        code: "INVALID_TOKEN_FORMAT",
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if user is admin
    if (decoded.role !== "admin") {
      return res.status(403).json({
        error: "Access denied. Admin privileges required.",
        code: "INSUFFICIENT_PRIVILEGES",
      });
    }

    // Add user info to request
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Access denied. Invalid token.",
        code: "INVALID_TOKEN",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Access denied. Token expired.",
        code: "TOKEN_EXPIRED",
      });
    }

    console.error("Auth middleware error:", error);
    return res.status(500).json({
      error: "Internal server error during authentication.",
      code: "AUTH_ERROR",
    });
  }
};

// mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vybtxro.mongodb.net/?appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.db("admin").command({ ping: 1 });
    console.log(
      "❤️ Pinged your deployment. You successfully connected to MongoDB!"
    );

    const db = client.db("AminWebTechDB");
    const usersCollection = db.collection("users");
    const servicesCollection = db.collection("services");
    const projectsCollection = db.collection("projects");
    const blogsCollection = db.collection("blogs");
    const teamMembersCollection = db.collection("teamMembers");
    const testimonialsCollection = db.collection("testimonials");
    const contactsCollection = db.collection("contacts");
    const repliesCollection = db.collection("replies");
    const mediaCollection = db.collection("media");

    // Analytics Collections
    const analyticsCollection = db.collection("analytics");
    const visitorsCollection = db.collection("visitors");
    const pageViewsCollection = db.collection("pageViews");

    // Seed testimonials data if collection is empty
    const testimonialsCount = await testimonialsCollection.countDocuments();
    if (testimonialsCount === 0) {
      const sampleTestimonials = [
        {
          name: "Sarah Johnson",
          company: "Global Tech Solutions",
          position: "CTO",
          rating: 5,
          testimonial:
            "Professional team with great attention to detail. Their expertise in web development exceeded our expectations. Will definitely work with them again on future projects.",
          featured: true,
          active: true,
          displayOrder: 1,
          date: "2024-12-24",
          createdAt: new Date("2024-12-24"),
          updatedAt: new Date("2024-12-24"),
        },
        {
          name: "David Chen",
          company: "Innovate Inc",
          position: "Product Manager",
          rating: 4,
          testimonial:
            "The platform they built is intuitive and easy to use. The support team was very helpful throughout the development process. Great communication and timely delivery.",
          featured: false,
          active: true,
          displayOrder: 2,
          date: "2024-12-20",
          createdAt: new Date("2024-12-20"),
          updatedAt: new Date("2024-12-20"),
        },
        {
          name: "Emily Rodriguez",
          company: "StartupXYZ",
          position: "Founder & CEO",
          rating: 5,
          testimonial:
            "Exceeded our expectations in every way. The team delivered a high-quality solution that perfectly matched our requirements. Highly recommend their services to anyone looking for professional web development.",
          featured: true,
          active: true,
          displayOrder: 3,
          date: "2024-12-18",
          createdAt: new Date("2024-12-18"),
          updatedAt: new Date("2024-12-18"),
        },
        {
          name: "Michael Thompson",
          company: "TechCorp Ltd",
          position: "Lead Developer",
          rating: 5,
          testimonial:
            "Outstanding work quality and timely delivery. The code is clean, well-documented, and follows best practices. Great communication throughout the project lifecycle.",
          featured: false,
          active: true,
          displayOrder: 4,
          date: "2024-12-15",
          createdAt: new Date("2024-12-15"),
          updatedAt: new Date("2024-12-15"),
        },
        {
          name: "Lisa Wang",
          company: "Digital Dynamics",
          position: "Marketing Director",
          rating: 4,
          testimonial:
            "Professional service and excellent results. The website they created has significantly improved our online presence and user engagement. Very satisfied with the outcome.",
          featured: false,
          active: true,
          displayOrder: 5,
          date: "2024-12-10",
          createdAt: new Date("2024-12-10"),
          updatedAt: new Date("2024-12-10"),
        },
      ];

      await testimonialsCollection.insertMany(sampleTestimonials);
      console.log("✅ Sample testimonials data seeded successfully");
    }

    // Seed contacts data if collection is empty (for testing)
    const contactsCount = await contactsCollection.countDocuments();
    if (contactsCount === 0) {
      const sampleContacts = [
        {
          name: "Akash Rahman",
          email: "akash@gmail.com",
          phone: "01814726978",
          subject: "Need a website",
          message:
            "Hello, I am looking for a professional website for my business. Can you help me with this project?",
          status: "read",
          createdAt: new Date("2024-12-29"),
          updatedAt: new Date("2024-12-29"),
          readAt: new Date("2024-12-29"),
          repliedAt: null,
        },
        {
          name: "Sarah Johnson",
          email: "sarah@example.com",
          phone: "01712345678",
          subject: "Project Inquiry",
          message:
            "I would like to discuss a new project for my startup. We need a complete web solution with modern design.",
          status: "new",
          createdAt: new Date("2024-12-28"),
          updatedAt: new Date("2024-12-28"),
          readAt: null,
          repliedAt: null,
        },
        {
          name: "Mike Chen",
          email: "mike@company.com",
          phone: "01987654321",
          subject: "Support Request",
          message:
            "Having issues with the current system. The dashboard is not loading properly and we need urgent assistance.",
          status: "replied",
          createdAt: new Date("2024-12-27"),
          updatedAt: new Date("2024-12-27"),
          readAt: new Date("2024-12-27"),
          repliedAt: new Date("2024-12-27"),
        },
      ];

      await contactsCollection.insertMany(sampleContacts);
      console.log("✅ Sample contacts data seeded successfully");
    }

    // -----------------------user apis---------------
    // GET user
    app.get("/users", async (req, res) => {
      try {
        const users = await usersCollection.find().toArray();
        res.send(users);
      } catch (error) {
        res.status(500).send({ error: "Failed to fetch users" });
      }
    });

    // POST user
    app.post("/users", async (req, res) => {
      try {
        const user = req.body;
        if (!user?.email) {
          return res.status(400).send({ message: "Email is required" });
        }
        const existingUser = await usersCollection.findOne({
          email: user.email,
        });
        if (existingUser) {
          return res.status(409).send({ message: "User already exists" });
        }
        const result = await usersCollection.insertOne(user);
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Failed to add user" });
      }
    });

    // ----------------service Related api -----------------
    // GET services
    app.get("/services", async (req, res) => {
      try {
        const services = await servicesCollection.find().toArray();
        res.send(services);
      } catch (error) {
        res.status(500).send({ error: "Failed to fetch services" });
      }
    });

    // POST Services
    app.post("/services", async (req, res) => {
      try {
        const service = req.body;
        const result = await servicesCollection.insertOne(service);
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Failed to add Services" });
      }
    });

    // ----------------Projects Related API -----------------
    // GET projects with pagination and filters
    app.get("/projects", async (req, res) => {
      try {
        const {
          page = 1,
          limit = 10,
          search = "",
          status = "",
          category = "",
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build filter query
        let filter = {};

        if (search) {
          filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { clientName: { $regex: search, $options: "i" } },
          ];
        }

        if (status && status !== "All Status") {
          if (status === "Active") {
            filter.isActive = true;
          } else if (status === "Inactive") {
            filter.isActive = false;
          }
        }

        if (category && category !== "All Categories") {
          filter.category = category;
        }

        // Get projects with pagination
        const projects = await projectsCollection
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .toArray();

        // Get total count for pagination
        const total = await projectsCollection.countDocuments(filter);

        res.send({
          projects,
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        });
      } catch (error) {
        console.error("Get projects error:", error);
        res.status(500).send({ error: "Failed to fetch projects" });
      }
    });

    // GET single project by ID
    app.get("/projects/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const project = await projectsCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!project) {
          return res.status(404).send({ error: "Project not found" });
        }

        res.send(project);
      } catch (error) {
        console.error("Get project error:", error);
        res.status(500).send({ error: "Failed to fetch project" });
      }
    });

    // POST create new project
    app.post("/projects", async (req, res) => {
      try {
        const project = {
          ...req.body,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const result = await projectsCollection.insertOne(project);
        res.send(result);
      } catch (error) {
        console.error("Create project error:", error);
        res.status(500).send({ error: "Failed to create project" });
      }
    });

    // PUT update project
    app.put("/projects/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const updateData = {
          ...req.body,
          updatedAt: new Date(),
        };

        const result = await projectsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );

        if (result.matchedCount === 0) {
          return res.status(404).send({ error: "Project not found" });
        }

        res.send(result);
      } catch (error) {
        console.error("Update project error:", error);
        res.status(500).send({ error: "Failed to update project" });
      }
    });

    // DELETE project
    app.delete("/projects/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const result = await projectsCollection.deleteOne({
          _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
          return res.status(404).send({ error: "Project not found" });
        }

        res.send({ message: "Project deleted successfully" });
      } catch (error) {
        console.error("Delete project error:", error);
        res.status(500).send({ error: "Failed to delete project" });
      }
    });

    // ----------------Blog Posts Related API -----------------
    // GET blogs with pagination and filters
    app.get("/blogs", async (req, res) => {
      try {
        const { page = 1, limit = 10, search = "", status = "" } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build filter query
        let filter = {};

        if (search) {
          filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { excerpt: { $regex: search, $options: "i" } },
            { author: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } },
          ];
        }

        if (status && status !== "All Status") {
          filter.status = status;
        }

        // Get blogs with pagination
        const blogs = await blogsCollection
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .toArray();

        // Get total count for pagination
        const total = await blogsCollection.countDocuments(filter);

        res.send({
          blogs,
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        });
      } catch (error) {
        console.error("Get blogs error:", error);
        res.status(500).send({ error: "Failed to fetch blogs" });
      }
    });

    // GET single blog by ID
    app.get("/blogs/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const blog = await blogsCollection.findOne({ _id: new ObjectId(id) });

        if (!blog) {
          return res.status(404).send({ error: "Blog post not found" });
        }

        res.send(blog);
      } catch (error) {
        console.error("Get blog error:", error);
        res.status(500).send({ error: "Failed to fetch blog post" });
      }
    });

    // POST create new blog
    app.post("/blogs", async (req, res) => {
      try {
        const blog = {
          ...req.body,
          views: 0,
          status: req.body.publishImmediately ? "Published" : "Draft",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Remove publishImmediately field as it's not needed in the database
        delete blog.publishImmediately;

        const result = await blogsCollection.insertOne(blog);
        res.send(result);
      } catch (error) {
        console.error("Create blog error:", error);
        res.status(500).send({ error: "Failed to create blog post" });
      }
    });

    // PUT update blog
    app.put("/blogs/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const updateData = {
          ...req.body,
          updatedAt: new Date(),
        };

        // Handle publish status
        if (req.body.publishImmediately !== undefined) {
          updateData.status = req.body.publishImmediately
            ? "Published"
            : "Draft";
          delete updateData.publishImmediately;
        }

        const result = await blogsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );

        if (result.matchedCount === 0) {
          return res.status(404).send({ error: "Blog post not found" });
        }

        res.send(result);
      } catch (error) {
        console.error("Update blog error:", error);
        res.status(500).send({ error: "Failed to update blog post" });
      }
    });

    // DELETE blog
    app.delete("/blogs/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const result = await blogsCollection.deleteOne({
          _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
          return res.status(404).send({ error: "Blog post not found" });
        }

        res.send({ message: "Blog post deleted successfully" });
      } catch (error) {
        console.error("Delete blog error:", error);
        res.status(500).send({ error: "Failed to delete blog post" });
      }
    });

    // PUT increment blog views
    app.put("/blogs/:id/views", async (req, res) => {
      try {
        const { id } = req.params;
        const result = await blogsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $inc: { views: 1 } }
        );

        if (result.matchedCount === 0) {
          return res.status(404).send({ error: "Blog post not found" });
        }

        res.send({ message: "Views updated successfully" });
      } catch (error) {
        console.error("Update blog views error:", error);
        res.status(500).send({ error: "Failed to update blog views" });
      }
    });

    // ----------------Team Members Related API -----------------
    // GET team members with pagination and filters
    app.get("/team-members", async (req, res) => {
      try {
        const { page = 1, limit = 10, search = "", active = "" } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build filter query
        let filter = {};

        if (search) {
          filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { position: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { expertise: { $in: [new RegExp(search, "i")] } },
          ];
        }

        if (active && active !== "all") {
          filter.isActive = active === "true";
        }

        // Get team members with pagination
        const teamMembers = await teamMembersCollection
          .find(filter)
          .sort({ displayOrder: 1, createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .toArray();

        // Get total count for pagination
        const total = await teamMembersCollection.countDocuments(filter);

        res.send({
          teamMembers,
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        });
      } catch (error) {
        console.error("Get team members error:", error);
        res.status(500).send({ error: "Failed to fetch team members" });
      }
    });

    // GET single team member by ID
    app.get("/team-members/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const teamMember = await teamMembersCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!teamMember) {
          return res.status(404).send({ error: "Team member not found" });
        }

        res.send(teamMember);
      } catch (error) {
        console.error("Get team member error:", error);
        res.status(500).send({ error: "Failed to fetch team member" });
      }
    });

    // POST create new team member
    app.post("/team-members", async (req, res) => {
      try {
        const teamMember = {
          ...req.body,
          isActive: req.body.isActive !== undefined ? req.body.isActive : true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const result = await teamMembersCollection.insertOne(teamMember);
        res.send(result);
      } catch (error) {
        console.error("Create team member error:", error);
        res.status(500).send({ error: "Failed to create team member" });
      }
    });

    // PUT update team member
    app.put("/team-members/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const updateData = {
          ...req.body,
          updatedAt: new Date(),
        };

        const result = await teamMembersCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );

        if (result.matchedCount === 0) {
          return res.status(404).send({ error: "Team member not found" });
        }

        res.send(result);
      } catch (error) {
        console.error("Update team member error:", error);
        res.status(500).send({ error: "Failed to update team member" });
      }
    });

    // DELETE team member
    app.delete("/team-members/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const result = await teamMembersCollection.deleteOne({
          _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
          return res.status(404).send({ error: "Team member not found" });
        }

        res.send({ message: "Team member deleted successfully" });
      } catch (error) {
        console.error("Delete team member error:", error);
        res.status(500).send({ error: "Failed to delete team member" });
      }
    });

    // ----------------Testimonials Related API -----------------
    // GET testimonials with pagination and filters (Admin only)
    app.get("/api/testimonials", verifyAdmin, async (req, res) => {
      try {
        const {
          page = 1,
          limit = 10,
          search = "",
          featured = "",
          active = "",
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build filter query
        let filter = {};

        if (search) {
          filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { company: { $regex: search, $options: "i" } },
            { position: { $regex: search, $options: "i" } },
            { testimonial: { $regex: search, $options: "i" } },
          ];
        }

        if (featured && featured !== "all") {
          filter.featured = featured === "true";
        }

        if (active && active !== "all") {
          filter.active = active === "true";
        }

        // Get testimonials with pagination
        const testimonials = await testimonialsCollection
          .find(filter)
          .sort({ displayOrder: 1, createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .toArray();

        // Get total count for pagination
        const total = await testimonialsCollection.countDocuments(filter);

        res.send({
          testimonials,
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        });
      } catch (error) {
        console.error("Get testimonials error:", error);
        res.status(500).send({ error: "Failed to fetch testimonials" });
      }
    });

    // GET all testimonials (for frontend display)
    app.get("/testimonials", async (req, res) => {
      try {
        const { featured = "", active = "true" } = req.query;

        let filter = {};

        if (featured && featured !== "all") {
          filter.featured = featured === "true";
        }

        if (active && active !== "all") {
          filter.active = active === "true";
        }

        const testimonials = await testimonialsCollection
          .find(filter)
          .sort({ displayOrder: 1, createdAt: -1 })
          .toArray();

        res.send(testimonials);
      } catch (error) {
        console.error("Get testimonials error:", error);
        res.status(500).send({ error: "Failed to fetch testimonials" });
      }
    });

    // GET single testimonial by ID (Admin only)
    app.get("/api/testimonials/:id", verifyAdmin, async (req, res) => {
      try {
        const { id } = req.params;
        const testimonial = await testimonialsCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!testimonial) {
          return res.status(404).send({ error: "Testimonial not found" });
        }

        res.send(testimonial);
      } catch (error) {
        console.error("Get testimonial error:", error);
        res.status(500).send({ error: "Failed to fetch testimonial" });
      }
    });

    // POST create new testimonial (Admin only)
    app.post("/api/testimonials", verifyAdmin, async (req, res) => {
      try {
        const testimonial = {
          ...req.body,
          rating: parseInt(req.body.rating) || 5,
          displayOrder: parseInt(req.body.displayOrder) || 0,
          featured: req.body.featured || false,
          active: req.body.active !== undefined ? req.body.active : true,
          date: new Date().toISOString().split("T")[0],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const result = await testimonialsCollection.insertOne(testimonial);

        // Return the created testimonial with the new ID
        const createdTestimonial = await testimonialsCollection.findOne({
          _id: result.insertedId,
        });
        res.send(createdTestimonial);
      } catch (error) {
        console.error("Create testimonial error:", error);
        res.status(500).send({ error: "Failed to create testimonial" });
      }
    });

    // PUT update testimonial (Admin only)
    app.put("/api/testimonials/:id", verifyAdmin, async (req, res) => {
      try {
        const { id } = req.params;
        const updateData = {
          ...req.body,
          rating: parseInt(req.body.rating) || 5,
          displayOrder: parseInt(req.body.displayOrder) || 0,
          updatedAt: new Date(),
        };

        const result = await testimonialsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );

        if (result.matchedCount === 0) {
          return res.status(404).send({ error: "Testimonial not found" });
        }

        // Return the updated testimonial
        const updatedTestimonial = await testimonialsCollection.findOne({
          _id: new ObjectId(id),
        });
        res.send(updatedTestimonial);
      } catch (error) {
        console.error("Update testimonial error:", error);
        res.status(500).send({ error: "Failed to update testimonial" });
      }
    });

    // DELETE testimonial (Admin only)
    app.delete("/api/testimonials/:id", verifyAdmin, async (req, res) => {
      try {
        const { id } = req.params;
        const result = await testimonialsCollection.deleteOne({
          _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
          return res.status(404).send({ error: "Testimonial not found" });
        }

        res.send({ message: "Testimonial deleted successfully" });
      } catch (error) {
        console.error("Delete testimonial error:", error);
        res.status(500).send({ error: "Failed to delete testimonial" });
      }
    });

    // PUT toggle testimonial featured status (Admin only)
    app.put("/api/testimonials/:id/featured", verifyAdmin, async (req, res) => {
      try {
        const { id } = req.params;
        const { featured } = req.body;

        const result = await testimonialsCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              featured: featured,
              updatedAt: new Date(),
            },
          }
        );

        if (result.matchedCount === 0) {
          return res.status(404).send({ error: "Testimonial not found" });
        }

        res.send({
          message: "Testimonial featured status updated successfully",
        });
      } catch (error) {
        console.error("Update testimonial featured status error:", error);
        res
          .status(500)
          .send({ error: "Failed to update testimonial featured status" });
      }
    });

    // PUT toggle testimonial active status (Admin only)
    app.put("/api/testimonials/:id/active", verifyAdmin, async (req, res) => {
      try {
        const { id } = req.params;
        const { active } = req.body;

        const result = await testimonialsCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              active: active,
              updatedAt: new Date(),
            },
          }
        );

        if (result.matchedCount === 0) {
          return res.status(404).send({ error: "Testimonial not found" });
        }

        res.send({ message: "Testimonial active status updated successfully" });
      } catch (error) {
        console.error("Update testimonial active status error:", error);
        res
          .status(500)
          .send({ error: "Failed to update testimonial active status" });
      }
    });

    // ----------------Contacts Related API -----------------
    // GET contacts with pagination and filters (Admin only)
    app.get("/api/contacts", verifyAdmin, async (req, res) => {
      try {
        const { page = 1, limit = 10, search = "", status = "" } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build filter query
        let filter = {};

        if (search) {
          filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { subject: { $regex: search, $options: "i" } },
            { message: { $regex: search, $options: "i" } },
          ];
        }

        if (status && status !== "all") {
          filter.status = status;
        }

        // Get contacts with pagination
        const contacts = await contactsCollection
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .toArray();

        // Get total count for pagination
        const total = await contactsCollection.countDocuments(filter);

        // Get stats
        const stats = {
          total: await contactsCollection.countDocuments(),
          new: await contactsCollection.countDocuments({ status: "new" }),
          read: await contactsCollection.countDocuments({ status: "read" }),
          replied: await contactsCollection.countDocuments({
            status: "replied",
          }),
          spam: await contactsCollection.countDocuments({ status: "spam" }),
        };

        res.send({
          contacts,
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
          stats,
        });
      } catch (error) {
        console.error("Get contacts error:", error);
        res.status(500).send({ error: "Failed to fetch contacts" });
      }
    });

    // GET single contact by ID (Admin only)
    app.get("/api/contacts/:id", verifyAdmin, async (req, res) => {
      try {
        const { id } = req.params;
        const contact = await contactsCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!contact) {
          return res.status(404).send({ error: "Contact not found" });
        }

        res.send(contact);
      } catch (error) {
        console.error("Get contact error:", error);
        res.status(500).send({ error: "Failed to fetch contact" });
      }
    });

    // POST create new contact (from contact form)
    app.post("/api/contacts", async (req, res) => {
      try {
        const contact = {
          ...req.body,
          status: "new",
          createdAt: new Date(),
          updatedAt: new Date(),
          readAt: null,
          repliedAt: null,
        };

        const result = await contactsCollection.insertOne(contact);

        // Return the created contact with the new ID
        const createdContact = await contactsCollection.findOne({
          _id: result.insertedId,
        });
        res.send(createdContact);
      } catch (error) {
        console.error("Create contact error:", error);
        res.status(500).send({ error: "Failed to create contact" });
      }
    });

    // PUT update contact status (Admin only)
    app.put("/api/contacts/:id/status", verifyAdmin, async (req, res) => {
      try {
        const { id } = req.params;
        const { status } = req.body;

        const updateData = {
          status: status,
          updatedAt: new Date(),
        };

        // Add timestamp for specific status changes
        if (
          status === "read" &&
          !(await contactsCollection.findOne({
            _id: new ObjectId(id),
            readAt: { $exists: true },
          }))
        ) {
          updateData.readAt = new Date();
        }
        if (status === "replied") {
          updateData.repliedAt = new Date();
        }

        const result = await contactsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );

        if (result.matchedCount === 0) {
          return res.status(404).send({ error: "Contact not found" });
        }

        // Return the updated contact
        const updatedContact = await contactsCollection.findOne({
          _id: new ObjectId(id),
        });
        res.send(updatedContact);
      } catch (error) {
        console.error("Update contact status error:", error);
        res.status(500).send({ error: "Failed to update contact status" });
      }
    });

    // DELETE contact (Admin only)
    app.delete("/api/contacts/:id", verifyAdmin, async (req, res) => {
      try {
        const { id } = req.params;
        const result = await contactsCollection.deleteOne({
          _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
          return res.status(404).send({ error: "Contact not found" });
        }

        res.send({ message: "Contact deleted successfully" });
      } catch (error) {
        console.error("Delete contact error:", error);
        res.status(500).send({ error: "Failed to delete contact" });
      }
    });

    // GET contact stats (Admin only)
    app.get("/api/contacts/stats", verifyAdmin, async (req, res) => {
      try {
        const stats = {
          total: await contactsCollection.countDocuments(),
          new: await contactsCollection.countDocuments({ status: "new" }),
          read: await contactsCollection.countDocuments({ status: "read" }),
          replied: await contactsCollection.countDocuments({
            status: "replied",
          }),
          spam: await contactsCollection.countDocuments({ status: "spam" }),
        };

        res.send(stats);
      } catch (error) {
        console.error("Get contact stats error:", error);
        res.status(500).send({ error: "Failed to fetch contact stats" });
      }
    });

    // POST reply to contact (Admin only)
    app.post("/api/contacts/:id/reply", verifyAdmin, async (req, res) => {
      try {
        console.log("📧 POST /api/contacts/:id/reply - Request received");
        const { id } = req.params;
        const {
          message,
          adminEmail = "admin@aminwebtech.com",
          trackingId,
        } = req.body;

        console.log("Reply data:", { id, message, adminEmail, trackingId });

        // Get the contact first
        const contact = await contactsCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!contact) {
          return res.status(404).send({ error: "Contact not found" });
        }

        // Create reply record
        const replyData = {
          contactId: id,
          adminEmail,
          replyMessage: message,
          sentAt: new Date(),
          recipientEmail: contact.email,
          recipientName: contact.name,
          originalSubject: contact.subject,
          trackingId: trackingId || `TRACK_${id}_${Date.now()}`,
          method: trackingId ? "email_client" : "quick_reply",
          status: "sent",
        };

        // Store the reply in replies collection
        await repliesCollection.insertOne(replyData);

        // Update the contact status to 'replied' and add reply timestamp
        await contactsCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              status: "replied",
              repliedAt: new Date(),
              lastReply: {
                message,
                sentAt: new Date(),
                adminEmail,
                trackingId: replyData.trackingId,
                method: replyData.method,
              },
              updatedAt: new Date(),
            },
          }
        );

        console.log("✅ Reply tracked and contact updated");

        res.send({
          success: true,
          message: "Reply tracked successfully",
          trackingId: replyData.trackingId,
          replyData: {
            ...replyData,
            // Don't send sensitive data back
            adminEmail: undefined,
          },
        });
      } catch (error) {
        console.error("❌ Reply to contact error:", error);
        console.error("Error stack:", error.stack);
        res.status(500).send({
          error: "Failed to track reply",
          details: error.message,
          stack:
            process.env.NODE_ENV === "development" ? error.stack : undefined,
        });
      }
    });

    // POST webhook for email replies (for future email service integration)
    app.post("/api/contacts/email-webhook", async (req, res) => {
      try {
        console.log("📨 Email webhook received:", req.body);

        const {
          from,
          to,
          subject,
          text,
          html,
          messageId,
          inReplyTo,
          references,
        } = req.body;

        // Extract tracking ID from subject
        const trackingMatch = subject.match(/\[TRACK_([a-f0-9]+)_(\d+)\]/);

        if (trackingMatch) {
          const contactId = trackingMatch[1];
          const timestamp = trackingMatch[2];

          console.log("📧 Processing email reply for contact:", contactId);

          // Find the contact
          const contact = await contactsCollection.findOne({
            _id: new ObjectId(contactId),
          });

          if (contact) {
            // Create reply record for received email
            const emailReplyData = {
              contactId,
              fromEmail: from,
              toEmail: to,
              subject,
              message: text || html,
              receivedAt: new Date(),
              messageId,
              inReplyTo,
              references,
              trackingId: `TRACK_${contactId}_${timestamp}`,
              method: "email_received",
              status: "received",
            };

            // Store the received email reply
            await repliesCollection.insertOne(emailReplyData);

            // Update contact with received reply info
            await contactsCollection.updateOne(
              { _id: new ObjectId(contactId) },
              {
                $set: {
                  status: "replied",
                  lastEmailReply: {
                    from,
                    subject,
                    receivedAt: new Date(),
                    messageId,
                  },
                  updatedAt: new Date(),
                },
              }
            );

            console.log("✅ Email reply processed and stored");

            res.send({ success: true, message: "Email reply processed" });
          } else {
            console.log("❌ Contact not found for tracking ID");
            res.status(404).send({ error: "Contact not found" });
          }
        } else {
          console.log("❌ No tracking ID found in email subject");
          res.status(400).send({ error: "No tracking ID found" });
        }
      } catch (error) {
        console.error("❌ Email webhook error:", error);
        res.status(500).send({ error: "Failed to process email webhook" });
      }
    });

    // GET replies for a contact (Admin only)
    app.get("/api/contacts/:id/replies", verifyAdmin, async (req, res) => {
      try {
        const { id } = req.params;

        const replies = await repliesCollection
          .find({ contactId: id })
          .sort({ sentAt: -1, receivedAt: -1 })
          .toArray();

        res.send(replies);
      } catch (error) {
        console.error("Get replies error:", error);
        res.status(500).send({ error: "Failed to fetch replies" });
      }
    });

    // -----------------------Analytics APIs---------------

    // GET analytics overview (Admin only)
    app.get("/analytics/overview", verifyAdmin, async (req, res) => {
      try {
        const { timeRange = "7d" } = req.query;

        // Calculate date range
        const now = new Date();
        let startDate;

        switch (timeRange) {
          case "1d":
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case "7d":
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case "30d":
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }

        // Get total visitors
        const totalVisitors = await visitorsCollection.countDocuments({
          createdAt: { $gte: startDate },
        });

        // Get new visitors (first time visitors)
        const newVisitors = await visitorsCollection.countDocuments({
          createdAt: { $gte: startDate },
          isNewVisitor: true,
        });

        // Get active visitors (last 5 minutes)
        const activeNow = await visitorsCollection.countDocuments({
          lastActivity: { $gte: new Date(now.getTime() - 5 * 60 * 1000) },
        });

        // Calculate bounce rate
        const totalSessions = await visitorsCollection.countDocuments({
          createdAt: { $gte: startDate },
        });

        const bouncedSessions = await visitorsCollection.countDocuments({
          createdAt: { $gte: startDate },
          pageViews: { $lte: 1 },
        });

        const bounceRate =
          totalSessions > 0
            ? ((bouncedSessions / totalSessions) * 100).toFixed(1)
            : 0;

        res.send({
          totalVisitors,
          newVisitors,
          activeNow,
          bounceRate: `${bounceRate}%`,
        });
      } catch (error) {
        console.error("Analytics overview error:", error);
        res.status(500).send({ error: "Failed to fetch analytics overview" });
      }
    });

    // GET visitor distribution by country (Admin only)
    app.get(
      "/analytics/visitor-distribution",
      verifyAdmin,
      async (req, res) => {
        try {
          const { timeRange = "7d" } = req.query;

          const now = new Date();
          let startDate;

          switch (timeRange) {
            case "1d":
              startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
              break;
            case "7d":
              startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              break;
            case "30d":
              startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
              break;
            default:
              startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          }

          const distribution = await visitorsCollection
            .aggregate([
              {
                $match: {
                  createdAt: { $gte: startDate },
                },
              },
              {
                $group: {
                  _id: "$country",
                  count: { $sum: 1 },
                  countryCode: { $first: "$countryCode" },
                },
              },
              {
                $sort: { count: -1 },
              },
              {
                $limit: 10,
              },
            ])
            .toArray();

          // Calculate total for percentages
          const total = distribution.reduce((sum, item) => sum + item.count, 0);

          // Format data with colors and percentages
          const colors = [
            "#3B82F6",
            "#10B981",
            "#FBBF24",
            "#EF4444",
            "#8B5CF6",
            "#F59E0B",
            "#06B6D4",
            "#84CC16",
            "#F97316",
            "#EC4899",
          ];
          const countryFlags = {
            Bangladesh: "🇧🇩",
            "United States": "🇺🇸",
            Taiwan: "🇹🇼",
            India: "🇮🇳",
            "United Kingdom": "🇬🇧",
            Canada: "🇨🇦",
            Germany: "🇩🇪",
            France: "🇫🇷",
            Japan: "🇯🇵",
            Australia: "🇦🇺",
          };

          const formattedData = distribution.map((item, index) => ({
            name: item._id,
            value: item.count,
            color: colors[index % colors.length],
            flag: countryFlags[item._id] || "🌍",
            percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
          }));

          res.send(formattedData);
        } catch (error) {
          console.error("Visitor distribution error:", error);
          res
            .status(500)
            .send({ error: "Failed to fetch visitor distribution" });
        }
      }
    );

    // GET recent visitors (Admin only)
    app.get("/analytics/recent-visitors", verifyAdmin, async (req, res) => {
      try {
        const { limit = 10 } = req.query;

        const recentVisitors = await visitorsCollection
          .find({})
          .sort({ lastActivity: -1 })
          .limit(parseInt(limit))
          .toArray();

        const formattedVisitors = recentVisitors.map((visitor) => ({
          id: visitor._id,
          ip: visitor.ipAddress,
          country: visitor.country,
          city: visitor.city,
          device: visitor.device,
          browser: visitor.browser,
          pages: visitor.pageViews || 1,
          lastActivity: visitor.lastActivity,
          uniqueVisitorId: visitor.uniqueVisitorId,
          deviceId: visitor.deviceId,
        }));

        res.send(formattedVisitors);
      } catch (error) {
        console.error("Recent visitors error:", error);
        res.status(500).send({ error: "Failed to fetch recent visitors" });
      }
    });

    // GET top performing pages (Admin only)
    app.get("/analytics/top-pages", verifyAdmin, async (req, res) => {
      try {
        const { timeRange = "7d", limit = 10 } = req.query;

        const now = new Date();
        let startDate;

        switch (timeRange) {
          case "1d":
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case "7d":
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case "30d":
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }

        // Get top pages with bounce rate calculation
        const topPages = await pageViewsCollection
          .aggregate([
            {
              $match: {
                createdAt: { $gte: startDate },
              },
            },
            {
              $group: {
                _id: "$path",
                views: { $sum: 1 },
                visitors: { $addToSet: "$visitorId" },
                totalTime: { $sum: "$timeOnPage" },
                visitorIds: { $push: "$visitorId" },
              },
            },
            {
              $lookup: {
                from: "pageViews",
                let: {
                  currentPath: "$_id",
                  visitorIds: "$visitorIds",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $in: ["$visitorId", "$$visitorIds"] },
                          { $gte: ["$createdAt", startDate] },
                        ],
                      },
                    },
                  },
                  {
                    $group: {
                      _id: "$visitorId",
                      pageCount: { $sum: 1 },
                      pages: { $addToSet: "$path" },
                    },
                  },
                ],
                as: "visitorPageCounts",
              },
            },
            {
              $project: {
                path: "$_id",
                views: 1,
                visitors: { $size: "$visitors" },
                avgTime: {
                  $cond: {
                    if: { $gt: ["$views", 0] },
                    then: { $divide: ["$totalTime", "$views"] },
                    else: 0,
                  },
                },
                bounceRate: {
                  $let: {
                    vars: {
                      singlePageVisitors: {
                        $size: {
                          $filter: {
                            input: "$visitorPageCounts",
                            cond: { $eq: ["$$this.pageCount", 1] },
                          },
                        },
                      },
                      totalVisitors: { $size: "$visitors" },
                    },
                    in: {
                      $cond: {
                        if: { $gt: ["$$totalVisitors", 0] },
                        then: {
                          $multiply: [
                            {
                              $divide: [
                                "$$singlePageVisitors",
                                "$$totalVisitors",
                              ],
                            },
                            100,
                          ],
                        },
                        else: 0,
                      },
                    },
                  },
                },
              },
            },
            {
              $sort: { views: -1 },
            },
            {
              $limit: parseInt(limit),
            },
          ])
          .toArray();

        // Format the data
        const colors = [
          "bg-yellow-400",
          "bg-blue-400",
          "bg-green-400",
          "bg-purple-400",
          "bg-red-400",
        ];

        const formattedPages = topPages.map((page, index) => ({
          id: index + 1,
          url: page.path,
          path: page.path,
          views: page.views,
          visitors: page.visitors,
          avgTime: `${Math.round(page.avgTime / 60)}m ${Math.round(
            page.avgTime % 60
          )}s`,
          bounceRate: `${Math.round(page.bounceRate)}%`,
          color: colors[index % colors.length],
        }));

        console.log(
          `📊 Top pages calculated with bounce rates:`,
          formattedPages.map((p) => ({
            path: p.path,
            views: p.views,
            visitors: p.visitors,
            bounceRate: p.bounceRate,
          }))
        );

        res.send(formattedPages);
      } catch (error) {
        console.error("Top pages error:", error);
        res.status(500).send({ error: "Failed to fetch top pages" });
      }
    });

    // POST track visitor (for tracking new visitors)
    app.post("/analytics/track-visitor", async (req, res) => {
      try {
        const {
          ipAddress,
          userAgent,
          country,
          city,
          countryCode,
          device,
          browser,
          deviceId,
          path,
          referrer,
        } = req.body;

        // Create unique visitor identifier using IP + deviceId combination
        const uniqueVisitorId = `${ipAddress}_${deviceId}`;

        // Check if visitor exists using the unique identifier
        let visitor = await visitorsCollection.findOne({
          $or: [
            { uniqueVisitorId },
            // Fallback for old records without deviceId
            { ipAddress, deviceId: { $exists: false } },
          ],
        });

        if (!visitor) {
          // New visitor
          visitor = {
            uniqueVisitorId,
            ipAddress,
            deviceId,
            userAgent,
            country: country || "Unknown",
            city: city || "Unknown",
            countryCode: countryCode || "XX",
            device: device || "Desktop",
            browser: browser || "Unknown",
            isNewVisitor: true,
            pageViews: 1,
            createdAt: new Date(),
            lastActivity: new Date(),
          };

          const result = await visitorsCollection.insertOne(visitor);
          visitor._id = result.insertedId;

          console.log(
            `📱 New visitor tracked: ${device} device with ID ${deviceId} from IP ${ipAddress}`
          );
        } else {
          // Existing visitor - update
          await visitorsCollection.updateOne(
            { _id: visitor._id },
            {
              $set: {
                lastActivity: new Date(),
                isNewVisitor: false,
                // Update deviceId if it was missing (for old records)
                ...(deviceId &&
                  !visitor.deviceId && { deviceId, uniqueVisitorId }),
              },
              $inc: { pageViews: 1 },
            }
          );

          console.log(
            `🔄 Existing visitor updated: ${device} device with ID ${deviceId} from IP ${ipAddress}`
          );
        }

        // Track page view
        await pageViewsCollection.insertOne({
          visitorId: visitor._id,
          uniqueVisitorId,
          path: path || "/",
          referrer: referrer || "",
          createdAt: new Date(),
          timeOnPage: 0, // Will be updated when user leaves
        });

        res.send({
          success: true,
          visitorId: visitor._id,
          uniqueVisitorId,
          isNewDevice: !visitor || visitor.isNewVisitor,
        });
      } catch (error) {
        console.error("❌ Error tracking visitor:", error);
        res.status(500).send({ error: "Failed to track visitor" });
      }
    });

    // PUT update page time (when user leaves page)
    app.put("/analytics/update-page-time", async (req, res) => {
      try {
        const { visitorId, path, timeOnPage } = req.body;

        await pageViewsCollection.updateOne(
          {
            visitorId: new ObjectId(visitorId),
            path: path,
            timeOnPage: 0,
          },
          {
            $set: { timeOnPage: timeOnPage },
          }
        );

        res.send({ success: true });
      } catch (error) {
        console.error("Update page time error:", error);
        res.status(500).send({ error: "Failed to update page time" });
      }
    });

    // Authentication endpoint for admin login
    app.post("/api/auth/login", async (req, res) => {
      try {
        const { username, password } = req.body;

        console.log("🔐 Login attempt for username:", username);

        // Simple authentication - replace with proper authentication in production
        if (username === "admin" && password === "admin123") {
          // Generate JWT token
          const tokenPayload = {
            id: 1,
            username: username,
            role: "admin",
            iat: Math.floor(Date.now() / 1000), // Issued at
            exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // Expires in 24 hours
          };

          const token = jwt.sign(tokenPayload, JWT_SECRET);

          console.log("✅ Login successful for admin");

          res.send({
            success: true,
            token: token,
            user: {
              id: 1,
              username: username,
              role: "admin",
            },
            expiresIn: "24h",
          });
        } else {
          console.log("❌ Invalid credentials for username:", username);
          res.status(401).send({
            error: "Invalid credentials",
            code: "INVALID_CREDENTIALS",
          });
        }
      } catch (error) {
        console.error("Authentication error:", error);
        res.status(500).send({
          error: "Authentication failed",
          code: "AUTH_FAILED",
        });
      }
    });

    // ----------------Media Management API -----------------

    // GET all media files with pagination and filters (Admin only)
    app.get("/api/media", verifyAdmin, async (req, res) => {
      try {
        console.log("📁 GET /api/media - Request received");

        const {
          page = 1,
          limit = 20,
          search = "",
          type = "",
          sortBy = "createdAt",
          sortOrder = "desc",
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build filter query
        let filter = {};

        if (search) {
          filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { originalName: { $regex: search, $options: "i" } },
            { alt: { $regex: search, $options: "i" } },
          ];
        }

        if (type && type !== "All Types") {
          filter.type = type;
        }

        // Build sort query
        const sort = {};
        sort[sortBy] = sortOrder === "desc" ? -1 : 1;

        console.log("Media filter:", filter);
        console.log("Media sort:", sort);

        const [media, total] = await Promise.all([
          mediaCollection
            .find(filter)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .toArray(),
          mediaCollection.countDocuments(filter),
        ]);

        // Calculate stats
        const stats = await mediaCollection
          .aggregate([
            {
              $group: {
                _id: "$type",
                count: { $sum: 1 },
                totalSize: { $sum: "$size" },
              },
            },
          ])
          .toArray();

        const statsObj = {
          total: total,
          images: 0,
          documents: 0,
          videos: 0,
          audio: 0,
          totalSize: 0,
        };

        stats.forEach((stat) => {
          statsObj.totalSize += stat.totalSize;
          switch (stat._id) {
            case "Image":
              statsObj.images = stat.count;
              break;
            case "Document":
              statsObj.documents = stat.count;
              break;
            case "Video":
              statsObj.videos = stat.count;
              break;
            case "Audio":
              statsObj.audio = stat.count;
              break;
          }
        });

        console.log("✅ Media fetched successfully:", {
          total,
          mediaCount: media.length,
        });

        res.send({
          media,
          stats: statsObj,
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        });
      } catch (error) {
        console.error("❌ Get media error:", error);
        res.status(500).send({ error: "Failed to fetch media files" });
      }
    });

    // POST upload media file (Admin only)
    app.post("/api/media", verifyAdmin, async (req, res) => {
      try {
        console.log("📤 POST /api/media - Upload request received");

        const {
          name,
          originalName,
          type,
          size,
          url,
          display_url,
          thumb_url,
          medium_url,
          delete_url,
          alt,
          mimeType,
          width,
          height,
          imgbb_id,
          imgbb_filename,
          storage_provider,
        } = req.body;

        // Validate required fields
        if (!name || !type || !size) {
          return res.status(400).send({
            error: "Missing required fields: name, type, size",
          });
        }

        const mediaData = {
          name: name.trim(),
          originalName: originalName || name,
          type,
          size: parseInt(size),
          url: url || null,
          display_url: display_url || url || null,
          thumb_url: thumb_url || null,
          medium_url: medium_url || null,
          delete_url: delete_url || null,
          alt: alt || "",
          mimeType: mimeType || "",
          width: width ? parseInt(width) : null,
          height: height ? parseInt(height) : null,
          imgbb_id: imgbb_id || null,
          imgbb_filename: imgbb_filename || null,
          storage_provider: storage_provider || "local",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        console.log("Creating media file:", {
          ...mediaData,
          storage_provider: mediaData.storage_provider,
          imgbb_id: mediaData.imgbb_id ? "Present" : "None",
        });

        const result = await mediaCollection.insertOne(mediaData);

        console.log("✅ Media file created:", result.insertedId);

        res.status(201).send({
          _id: result.insertedId,
          ...mediaData,
          message: `Media file uploaded successfully${
            storage_provider === "imgbb" ? " to ImgBB" : ""
          }`,
        });
      } catch (error) {
        console.error("❌ Upload media error:", error);
        res.status(500).send({ error: "Failed to upload media file" });
      }
    });

    // PUT update media file (Admin only)
    app.put("/api/media/:id", verifyAdmin, async (req, res) => {
      try {
        const { id } = req.params;
        const updateData = { ...req.body };
        delete updateData._id;
        updateData.updatedAt = new Date();

        console.log("📝 Updating media file:", id, updateData);

        const result = await mediaCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );

        if (result.matchedCount === 0) {
          return res.status(404).send({ error: "Media file not found" });
        }

        console.log("✅ Media file updated:", id);
        res.send({ message: "Media file updated successfully" });
      } catch (error) {
        console.error("❌ Update media error:", error);
        res.status(500).send({ error: "Failed to update media file" });
      }
    });

    // DELETE single media file (Admin only)
    app.delete("/api/media/:id", verifyAdmin, async (req, res) => {
      try {
        const { id } = req.params;

        console.log("🗑️ Deleting media file:", id);

        const result = await mediaCollection.deleteOne({
          _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
          return res.status(404).send({ error: "Media file not found" });
        }

        console.log("✅ Media file deleted:", id);
        res.send({ message: "Media file deleted successfully" });
      } catch (error) {
        console.error("❌ Delete media error:", error);
        res.status(500).send({ error: "Failed to delete media file" });
      }
    });

    // DELETE multiple media files (Admin only)
    app.delete("/api/media", verifyAdmin, async (req, res) => {
      try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
          return res.status(400).send({ error: "Invalid or empty ids array" });
        }

        console.log("🗑️ Deleting multiple media files:", ids);

        const objectIds = ids.map((id) => new ObjectId(id));
        const result = await mediaCollection.deleteMany({
          _id: { $in: objectIds },
        });

        console.log("✅ Media files deleted:", result.deletedCount);

        res.send({
          message: `${result.deletedCount} media files deleted successfully`,
          deletedCount: result.deletedCount,
        });
      } catch (error) {
        console.error("❌ Delete multiple media error:", error);
        res.status(500).send({ error: "Failed to delete media files" });
      }
    });

    // GET media file by ID (Admin only)
    app.get("/api/media/:id", verifyAdmin, async (req, res) => {
      try {
        const { id } = req.params;

        console.log("📁 Getting media file:", id);

        const media = await mediaCollection.findOne({ _id: new ObjectId(id) });

        if (!media) {
          return res.status(404).send({ error: "Media file not found" });
        }

        console.log("✅ Media file found:", media.name);
        res.send(media);
      } catch (error) {
        console.error("❌ Get media by ID error:", error);
        res.status(500).send({ error: "Failed to fetch media file" });
      }
    });

    // Test endpoint for media
    app.get("/api/media/test", (req, res) => {
      res.send({ message: "Media API is working!", timestamp: new Date() });
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("AminWebTech Analytics Server is running!");
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
