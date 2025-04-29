export class UserDto {
    xrplAddress;
    email;
    name;
    userRole;
    description;
    lat;
    lng;
    constructor(xrplAddress, email, name, userRole, description, lat, lng) {
        this.xrplAddress = xrplAddress;
        this.email = email;
        this.name = name;
        this.userRole = userRole;
        this.description = description;
        this.lat = lat;
        this.lng = lng;
    }
}