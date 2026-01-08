const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 3000;

// middleware
app.use(express.json());
app.use(cors());

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

    // Analytics Collections
    const analyticsCollection = db.collection("analytics");
    const visitorsCollection = db.collection("visitors");
    const pageViewsCollection = db.collection("pageViews");

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

    // -----------------------Analytics APIs---------------

    // GET analytics overview
    app.get("/analytics/overview", async (req, res) => {
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

    // GET visitor distribution by country
    app.get("/analytics/visitor-distribution", async (req, res) => {
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
        res.status(500).send({ error: "Failed to fetch visitor distribution" });
      }
    });

    // GET recent visitors
    app.get("/analytics/recent-visitors", async (req, res) => {
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

    // GET top performing pages
    app.get("/analytics/top-pages", async (req, res) => {
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
          avgTime: `${Math.round(page.avgTime / 60)}m`,
          bounceRate: "N/A", // Calculate if needed
          color: colors[index % colors.length],
        }));

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

        // Simple authentication - replace with proper authentication
        if (username === "admin" && password === "admin123") {
          res.send({
            success: true,
            token: "jwt-token-here",
            user: { id: 1, username, role: "admin" },
          });
        } else {
          res.status(401).send({ error: "Invalid credentials" });
        }
      } catch (error) {
        res.status(500).send({ error: "Authentication failed" });
      }
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
