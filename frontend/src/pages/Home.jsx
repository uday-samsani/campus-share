import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { BookOpen, Users, MessageSquare, ShoppingBag, ArrowRight, Star } from 'lucide-react'

const Home = () => {
  const { user } = useAuth()

  const features = [
    {
      icon: ShoppingBag,
      title: 'Marketplace',
      description: 'Buy, sell, or rent textbooks, laptops, and cloud credits from fellow students.',
      link: '/marketplace'
    },
    {
      icon: Users,
      title: 'Study Groups',
      description: 'Form study groups, find study partners, and collaborate on coursework.',
      link: '/study-groups'
    },
    {
      icon: MessageSquare,
      title: 'Connect',
      description: 'Message other students, ask questions, and build academic relationships.',
      link: user ? '/messages' : '/login'
    }
  ]

  const stats = [
    { label: 'Students Connected', value: '2,500+' },
    { label: 'Items Shared', value: '15,000+' },
    { label: 'Study Groups', value: '300+' },
    { label: 'Universities', value: '50+' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Share Resources,
              <span className="text-primary block">Build Connections</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              CampusShare connects students to share textbooks, laptops, cloud credits, and form study groups. 
              Save money, reduce waste, and build lasting academic relationships.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user ? (
                <>
                  <Link to="/register" className="btn-primary text-lg px-8 py-3">
                    Get Started
                  </Link>
                  <Link to="/marketplace" className="btn-outline text-lg px-8 py-3">
                    Browse Marketplace
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/create-listing" className="btn-primary text-lg px-8 py-3">
                    List an Item
                  </Link>
                  <Link to="/marketplace" className="btn-outline text-lg px-8 py-3">
                    Browse Marketplace
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              CampusShare provides all the tools you need to make the most of your academic journey.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">{feature.title}</h3>
                <p className="text-muted-foreground mb-6">{feature.description}</p>
                <Link 
                  to={feature.link}
                  className="inline-flex items-center text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Learn More <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of students who are already sharing resources and building connections on CampusShare.
            </p>
            {!user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="btn-primary text-lg px-8 py-3">
                  Create Account
                </Link>
                <Link to="/login" className="btn-outline text-lg px-8 py-3">
                  Sign In
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/create-listing" className="btn-primary text-lg px-8 py-3">
                  List Your First Item
                </Link>
                <Link to="/study-groups" className="btn-outline text-lg px-8 py-3">
                  Find Study Groups
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Students Say
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                university: "Stanford University",
                text: "CampusShare helped me find affordable textbooks and connect with study partners. It's been a game-changer for my academic experience.",
                rating: 5
              },
              {
                name: "Marcus Johnson",
                university: "MIT",
                text: "I've made great friends through study groups and saved hundreds on textbooks. The platform is intuitive and the community is amazing.",
                rating: 5
              },
              {
                name: "Emma Rodriguez",
                university: "UC Berkeley",
                text: "As a computer science student, finding affordable cloud credits was crucial. CampusShare made it easy to connect with other students.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="card p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">"{testimonial.text}"</p>
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.university}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
