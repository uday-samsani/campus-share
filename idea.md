## 1. Abstract/Summary
### **CampusShare: Student Resource Sharing Platform**
CampusShare is a web marketplace where students share textbooks, laptops, cloud credits, and form study groups. The platform connects students who have unused resources with those who need them.

**What will be done?** Build a 3-tier web application using React frontend, Node.js backend, and AWS cloud services. Students can list items, search resources, message each other, and join study groups.

**What problem does it solve?** Students buy expensive textbooks for one semester while others can't afford them. Computing equipment sits unused while other students need access. Study group formation is difficult and inefficient.

**Who benefits?** All students save money, reduce waste, and build academic connections through resource sharing and collaboration.

## 2. Statement of Need

Students face common resource challenges:
- Expensive textbooks used only one semester
- Unused laptops and equipment during idle periods
- Excess cloud computing credits while others run out
- Difficulty finding study partners and relevant clubs

Current solutions are fragmented across multiple platforms (Facebook groups, bulletin boards), creating inefficiency and safety concerns. CampusShare provides a trusted, centralized platform specifically for student needs.

## 3. Project Activity, Methodology, and Outcomes
### **Technology Stack**
**Frontend:** React.js, Bootstrap  
**Backend:** Node.js, Express  
**Cloud Services:** AWS
### **Core Features**
**Marketplace:**
- List textbooks, laptops, cloud credits for sale/rent
- Search and filter items by category and price
- Upload photos for listings

**Social Features:**
- Create and join study groups for courses
- Browse campus clubs and organizations
- Basic messaging between users

**User Management:**
- Registration with university email
- User profiles with ratings
- Secure authentication

### **System Design**
- **Frontend:** React web app hosted on S3
- **Backend:** Lambda functions for business logic
- **Database:** DynamoDB for users, listings, messages

### **Expected Outcomes**
- Complete CampusShare web platform
- Working marketplace with user registration and item listings
- Search functionality and messaging system
- Study group formation and club discovery