# Kaviospix

A REST API for an image management application that allows users to search, upload, edit, and manage album images.
Built using Express.js, Node.js, MongoDB, and JWT authentication.


---

## Demo Link
[Live Demo](https://fsp-1-assignment-backend-mu.vercel.app/api/task)



## Features 

- Create and manage albums
- Upload and delete images
- Mark images as favorites
- Add comments on images
- Share albums with other users
- JWT-based authentication
- MongoDB database integration


---

## Tech Stack
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication


---

## Quick Start

```
git clone https://github.com/rahulCode1/kaviosPix_frontend.git
cd kaviospix-backend
npm install
npm run dev
```



---

Environment Variables

Create a .env file in the root directory and add:<br>

PORT= 80<br>
MONGODB_URI= XXXXXXXXXXXXXX<br>
JWT_SECRET=   XXXXXXXXXXXX<br>


---

## API Reference

### **GET /api/albums**<br>

List all albums<br>
Sample Response:<br>

```
[
    {
        _id,
        name,
        description,
        ...
    },
    ...
]
```

### **POST /api/albums**<br>

Add new Album <br>
Sample Response:<br>

```

    {
        _id,
        name,
        description,
        ...
    }


```

### **PUT /api/albums/:albumId**<br>

Update album<br>
Sample Response:<br>

```

    {
        _id,
        name,
        description,
        ...
    }


```

### **PUT /api/albums/:albumId/share**<br>

Allow other users to see your album<br>
Sample Response:<br>

```

    {
        _id,
        emails: ["user1@gmail.com", ...]
    }


```

### **GET /api/albums/:albumId/favorites**<br>

Get all favorite images in your album<br>
Sample Response:<br>

```
[
    {
        _id,
       name,
       imageUrl,
       isFavorite,
       ...
    },
    ...

]
```

### **DELETE /api/albums/:albumId**<br>

Delete album<br>
Sample Response:<br>

```

    {
        _id,
        albumId
    }


```

### **GET /api/albums**<br>

List all images in an album<br>
Sample Response:<br>

```
[
    {
        _id,
        name,
        description,
        ...
    },
    ...
]
```

### **GET /api/image/:albumId/images/:imageId/details**<br>

Single image details<br>
Sample Response:<br>

```

   {
        _id,
       name,
       imageUrl,
       isFavorite,
       ...
    },
    
```

### **POST /api/image/:albumId/images**<br>

Add a new image to an album<br>
Sample Response:<br>

```

   {
        _id,
       name,
       imageUrl,
       isFavorite,
       ...
    },


```

### **PUT /api/image/:albumId/images/:imageId/favorite**<br>

Mark the image as a favorite in an album<br>
Sample Response:<br>

```

   {
        _id,
       name,
       imageUrl,
       isFavorite

    },


```

### **POST /api/image/:imageId/comments**<br>

Add comments to an image.<br>
Sample Response:<br>

```

   {
        _id,
       comment

    }


```

### **DELETE /api/image/:albumId/images/:imageId/delete**<br>

Delete the selected image from the album.<br>
Sample Response:<br>

```
  {
        _id,
       imageId

    }

```

### **GET /api/users/users**<br>

List of all users<br>
Sample Response<br>

```
[
    {
        _id,
        email,
        name
    }
]
```

---

## Contact

For bugs or feature requests, please reach out to rahulkumawat50665@gmail.com
