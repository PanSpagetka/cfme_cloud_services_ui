$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "red_hat_cloud_services/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "red_hat_cloud_services"
  s.version     = RedHatCloudServices::VERSION
  s.authors     = ["Martin Povolny"]
  s.email       = ["mpovolny@redhat.com"]
  s.homepage    = "http://www.manageiq.org"
  s.summary     = "ManageIQ plugin example"
  s.description = "ManageIQ plugin example"
  s.license     = "MIT"

  s.files = Dir["{app,config,db,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.md"]

  s.add_dependency "rails", ">= 5.0.0.1", "< 5.2"

  s.add_development_dependency "sqlite3"
end
