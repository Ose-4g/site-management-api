# site-management-api
API for power comapnies to manage multiple sites.

### High Level Description

The API allows users(managers) to constantly monitor usage and update data returned from the devices connnected to a given site.

#### Technical Details

A modular monolith architecture is used in the design of this project, and this involves building modules that only link to other modules that specifically provides services it needs. This approach reduces the dependencies of a module in such as way that you can enhance/change a module without it effecting other modules.

### Endpoints

1. Create a company: Requires an email, name and password

2. Invite a manager: Requires an email and a name

3. Company Login:

4. Manager Login: