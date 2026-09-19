const SUPABASE_URL = "https://jzonxaehebtsehsexsjf.supabase.co";
const SUPABASE_KEY = "sb_publishable_pjenIq_tMZbR0E5opwfX8A_C7hol6Od";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("nav");

if (menuToggle && nav) {

    menuToggle.addEventListener("click", () => {
        nav.classList.toggle("open");
    });

    nav.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            nav.classList.remove("open");
        });
    });

}
console.log("Supabase connected:", supabaseClient);
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        loginMessage.textContent = "Logging in...";

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {

            loginMessage.textContent = error.message;

            return;
        }

        loginMessage.textContent = "Login successful!";

        window.location.href = "admin-dashboard.html";

    });
    const forgotPassword =
    document.getElementById("forgotPassword");

if (forgotPassword) {

    forgotPassword.addEventListener("click", async function (event) {

        event.preventDefault();

        const email =
            document.getElementById("email").value.trim();

        if (!email) {
            alert("Please enter your admin email address first.");
            return;
        }

        const { error } =
            await supabaseClient.auth.resetPasswordForEmail(
                email,
                {
                   redirectTo:
    "https://ifecojnr.github.io/cradle-saints-web/reset-password.html"
                }
            );

        if (error) {
            console.error(error);

            alert(
                "Unable to send password reset email: " +
                error.message
            );

            return;
        }

        alert(
            "Password reset email sent. Please check your email."
        );

    });

}

}// ===============================
// ANNOUNCEMENT MANAGER
// ===============================

const announcementForm = document.getElementById("announcementForm");

if (announcementForm) {

    announcementForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const title = document.getElementById("announcementTitle").value.trim();
        const content = document.getElementById("announcementContent").value.trim();
        const published = document.getElementById("announcementPublished").checked;

        if (!title || !content) {
            alert("Please enter both a title and announcement content.");
            return;
        }

        const announcementId = document.getElementById("announcementId").value;

let data;
let error;

if (announcementId) {

    const result = await supabaseClient
        .from("Announcement")
        .update({
            title: title,
            content: content,
            published: published
        })
        .eq("id", announcementId);

    data = result.data;
    error = result.error;

} else {

    const result = await supabaseClient
        .from("Announcement")
        .insert([
            {
                title: title,
                content: content,
                published: published
            }
        ]);

    data = result.data;
    error = result.error;

}

        if (error) {
            console.error(error);
            alert("Failed to save announcement: " + error.message);
            return;
        }

        alert("Announcement saved successfully!");

        announcementForm.reset();

    });

}
// ===============================
// LOAD ANNOUNCEMENTS
// ===============================

async function loadAnnouncements() {

    const announcementList = document.getElementById("announcementList");

    if (!announcementList) {
        return;
    }

    const { data, error } = await supabaseClient
        .from("Announcement")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);
        announcementList.innerHTML = "<p>Unable to load announcements.</p>";
        return;
    }

    announcementList.innerHTML = "";

    if (data.length === 0) {
        announcementList.innerHTML = "<p>No announcements yet.</p>";
        return;
    }

    data.forEach(function (announcement) {

    const item = document.createElement("div");

   
item.innerHTML = `
    <div class="announcement-header">

        <h3>${announcement.title}</h3>

    </div>

    <p class="announcement-content">
        ${announcement.content}
    </p>

    <div class="announcement-actions">

        <button
            class="edit-announcement"
            data-id="${announcement.id}">
            Edit
        </button>

        <button
            class="delete-announcement"
            data-id="${announcement.id}">
            Delete
        </button>

    </div>
`;
    announcementList.appendChild(item);

});

}

loadAnnouncements();
// ===============================
// DELETE ANNOUNCEMENT
// ===============================

document.addEventListener("click", async function (event) {

    if (!event.target.classList.contains("delete-announcement")) {
        return;
    }

    const announcementId = event.target.dataset.id;

    const confirmDelete = confirm(
        "Are you sure you want to delete this announcement?"
    );

    if (!confirmDelete) {
        return;
    }

    const { error } = await supabaseClient
        .from("Announcement")
        .delete()
        .eq("id", announcementId);

    if (error) {
        console.error(error);
        alert("Failed to delete announcement: " + error.message);
        return;
    }

    alert("Announcement deleted successfully!");

    loadAnnouncements();

});
// ===============================
// EDIT ANNOUNCEMENT
// ===============================

document.addEventListener("click", async function (event) {

    if (!event.target.classList.contains("edit-announcement")) {
        return;
    }

    const announcementId = event.target.dataset.id;

    const { data, error } = await supabaseClient
        .from("Announcement")
        .select("*")
        .eq("id", announcementId)
        .single();

    if (error) {
        console.error(error);
        alert("Unable to load announcement: " + error.message);
        return;
    }

    document.getElementById("announcementId").value = data.id;
    document.getElementById("announcementTitle").value = data.title;
    document.getElementById("announcementContent").value = data.content;
    document.getElementById("announcementPublished").checked = data.published;

});
// =========================================
// HOME ANNOUNCEMENT TICKER
// =========================================

async function loadHomeAnnouncements() {

    const ticker =
        document.getElementById("publicAnnouncementTicker");

    if (!ticker) {
        return;
    }

    const { data, error } = await supabaseClient
        .from("Announcement")
        .select("title, content")
        .eq("published", true)
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);

        ticker.innerHTML = `
            <span>
                Unable to load announcements.
            </span>
        `;

        return;
    }

    if (!data || data.length === 0) {

        ticker.innerHTML = `
            <span>
                No announcements at the moment.
            </span>
        `;

        return;
    }

    ticker.innerHTML = "";

    data.forEach(function (announcement) {

        const item = document.createElement("span");

        item.textContent =
            announcement.title +
            " — " +
            announcement.content;

        ticker.appendChild(item);
    });

    // Duplicate the announcements so the ticker
    // can keep moving continuously.
    data.forEach(function (announcement) {

        const item = document.createElement("span");

        item.textContent =
            announcement.title +
            " — " +
            announcement.content;

        ticker.appendChild(item);
    });
}

loadHomeAnnouncements();
// =========================================
// GALLERY ALBUM MANAGER
// =========================================

const albumForm = document.getElementById("albumForm");

if (albumForm) {

    albumForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const albumName =
            document.getElementById("albumName").value.trim();

        const albumDescription =
            document.getElementById("albumDescription").value.trim();

        if (!albumName) {
            alert("Please enter an album name.");
            return;
        }

        const { error } = await supabaseClient
            .from("Gallery_albums")
            .insert([
                {
                    name: albumName,
                    description: albumDescription
                }
            ]);

        if (error) {

            console.error(error);

            alert(
                "Failed to create album: " +
                error.message
            );

            return;
        }

        alert("Album created successfully!");

        albumForm.reset();

    });

}
// =========================================
// LOAD ALBUMS INTO PHOTO UPLOAD DROPDOWN
// =========================================

async function loadGalleryAlbums() {

    const albumSelect =
        document.getElementById("photoAlbum");

    if (!albumSelect) {
        return;
    }

    const { data, error } = await supabaseClient
        .from("Gallery_albums")
        .select("id, name")
        .order("created_at", { ascending: false });

    if (error) {

        console.error(error);

        albumSelect.innerHTML = `
            <option value="">
                Unable to load albums
            </option>
        `;

        return;
    }

    albumSelect.innerHTML = `
        <option value="">
            Select an album
        </option>
    `;

    data.forEach(function (album) {

        const option = document.createElement("option");

        option.value = album.id;
        option.textContent = album.name;

        albumSelect.appendChild(option);

    });

}

loadGalleryAlbums();
// =========================================
// GALLERY PHOTO UPLOAD
// =========================================

const photoUploadForm =
    document.getElementById("photoUploadForm");

if (photoUploadForm) {

    photoUploadForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const albumId =
            document.getElementById("photoAlbum").value;

        const files =
            document.getElementById("galleryPhotos").files;

        const selectedPhotoInfo =
            document.getElementById("selectedPhotoInfo");

        if (!albumId) {
            alert("Please select an album.");
            return;
        }

        if (!files || files.length === 0) {
            alert("Please select at least one photo.");
            return;
        }

        selectedPhotoInfo.textContent =
            "Uploading photos...";

        for (const file of files) {

            const fileName =
                Date.now() + "-" + file.name;

            const filePath =
                albumId + "/" + fileName;

            const { error: uploadError } =
                await supabaseClient
                    .storage
                    .from("gallery")
                    .upload(filePath, file);

            if (uploadError) {

                console.error(uploadError);

                alert(
                    "Failed to upload " +
                    file.name +
                    ": " +
                    uploadError.message
                );

                selectedPhotoInfo.textContent = "";
                return;
            }

            const { data: publicUrlData } =
                supabaseClient
                    .storage
                    .from("gallery")
                    .getPublicUrl(filePath);

            const imageUrl =
                publicUrlData.publicUrl;

            const { error: databaseError } =
                await supabaseClient
                    .from("gallery_photos")
                    .insert([
                        {
                            album_id: albumId,
                            image_url: imageUrl
                        }
                    ]);

            if (databaseError) {

                console.error(databaseError);

                alert(
                    "Photo uploaded, but its database record could not be saved: " +
                    databaseError.message
                );

                selectedPhotoInfo.textContent = "";
                return;
            }
        }

        alert("Photos uploaded successfully!");

        document.getElementById("galleryPhotos").value = "";

        selectedPhotoInfo.textContent = "";

    });

}
// =========================================
// PUBLIC GALLERY
// =========================================

async function loadPublicGallery() {

    const gallery =
        document.getElementById("publicGallery");

    if (!gallery) {
        return;
    }

    const { data, error } = await supabaseClient
        .from("gallery_photos")
        .select(`
            image_url,
            caption,
            album_id,
            Gallery_albums (
                name,
                description
            )
        `)
        .order("created_at", { ascending: false });

    if (error) {

        console.error(error);

        gallery.innerHTML = `
            <p class="gallery-loading">
                Unable to load gallery photos.
            </p>
        `;

        return;
    }

    if (!data || data.length === 0) {

        gallery.innerHTML = `
            <div class="gallery-empty">
                <div class="gallery-empty-icon">
                    📷
                </div>

                <h3>Gallery Coming Soon</h3>

                <p>
                    Photos from Cradle Saints Nursery & Primary School
                    will be added here as they become available.
                </p>
            </div>
        `;

        return;
    }

    gallery.innerHTML = "";
lightboxPhotos = [];
    const albums = {};

    data.forEach(function (photo) {

        const albumName =
            photo.Gallery_albums?.name ||
            "School Photos";

        if (!albums[albumName]) {
            albums[albumName] = [];
        }

        albums[albumName].push(photo);

    });

    Object.keys(albums).forEach(function (albumName) {

        const albumSection =
            document.createElement("div");

        albumSection.className =
            "public-gallery-album";

        albumSection.innerHTML = `
            <div class="public-gallery-album-heading">
                <h3>${albumName}</h3>
            </div>

            <div class="public-gallery-grid"></div>
        `;

        const grid =
            albumSection.querySelector(
                ".public-gallery-grid"
            );

        albums[albumName].forEach(function (photo) {

            const photoCard =
                document.createElement("div");

            photoCard.className =
                "public-gallery-photo";

            photoCard.innerHTML = `
    <img
        src="${photo.image_url}"
        alt="${photo.caption || albumName}"
        loading="lazy"
    >
    ${
        photo.caption
            ? `<p>${photo.caption}</p>`
            : ""
    }
`;

const photoImage =
    photoCard.querySelector("img");
    const photoIndex =
    lightboxPhotos.length;

lightboxPhotos.push(photo);

photoImage.addEventListener(
    "click",
    function () {
        openLightbox(photoIndex);
    }
);

            grid.appendChild(photoCard);

        });

        gallery.appendChild(albumSection);

    });

}

loadPublicGallery();
// =========================================
// GALLERY LIGHTBOX
// =========================================

let lightboxPhotos = [];
let currentLightboxIndex = 0;

const galleryLightbox =
    document.getElementById("galleryLightbox");

const lightboxImage =
    document.getElementById("lightboxImage");

const lightboxCaption =
    document.getElementById("lightboxCaption");

const lightboxClose =
    document.getElementById("lightboxClose");

const lightboxPrevious =
    document.getElementById("lightboxPrevious");

const lightboxNext =
    document.getElementById("lightboxNext");


function openLightbox(index) {

    if (!lightboxPhotos.length) {
        return;
    }

    currentLightboxIndex = index;

    const photo =
        lightboxPhotos[currentLightboxIndex];

    lightboxImage.src =
        photo.image_url;

    lightboxImage.alt =
        photo.caption || "School photo";

    lightboxCaption.textContent =
        photo.caption || "";

    galleryLightbox.classList.add("active");

    document.body.style.overflow = "hidden";
}


function closeLightbox() {

    galleryLightbox.classList.remove("active");

    document.body.style.overflow = "";

}


function showPreviousPhoto() {

    currentLightboxIndex--;

    if (currentLightboxIndex < 0) {
        currentLightboxIndex =
            lightboxPhotos.length - 1;
    }

    openLightbox(currentLightboxIndex);
}


function showNextPhoto() {

    currentLightboxIndex++;

    if (
        currentLightboxIndex >=
        lightboxPhotos.length
    ) {
        currentLightboxIndex = 0;
    }

    openLightbox(currentLightboxIndex);
}


if (lightboxClose) {

    lightboxClose.addEventListener(
        "click",
        closeLightbox
    );

}


if (lightboxPrevious) {

    lightboxPrevious.addEventListener(
        "click",
        showPreviousPhoto
    );

}


if (lightboxNext) {

    lightboxNext.addEventListener(
        "click",
        showNextPhoto
    );

}


if (galleryLightbox) {

    galleryLightbox.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                galleryLightbox
            ) {
                closeLightbox();
            }

        }
    );

}


document.addEventListener(
    "keydown",
    function (event) {

        if (
            !galleryLightbox ||
            !galleryLightbox.classList.contains("active")
        ) {
            return;
        }

        if (event.key === "Escape") {
            closeLightbox();
        }

        if (event.key === "ArrowLeft") {
            showPreviousPhoto();
        }

        if (event.key === "ArrowRight") {
            showNextPhoto();
        }

    }
);
async function loadAdminGalleryAlbums() {

    const albumContainer =
        document.getElementById("adminGalleryAlbums");

    if (!albumContainer) return;

    const { data, error } = await supabaseClient
        .from("Gallery_albums")
        .select("id, name, description, created_at")
        .order("created_at", { ascending: false });

    if (error) {

        console.error(error);

        albumContainer.innerHTML =
            "<p>Unable to load albums.</p>";

        return;
    }

    albumContainer.innerHTML = "";

    if (!data || data.length === 0) {

        albumContainer.innerHTML =
            "<p>No albums created yet.</p>";

        return;
    }

    data.forEach(function (album) {

        const albumItem =
            document.createElement("div");

        albumItem.className =
            "admin-gallery-album";

       albumItem.innerHTML = `
    <div class="admin-gallery-album-info">

        <h4>
            ${album.name}
        </h4>

        ${
            album.description
                ? `<p>${album.description}</p>`
                : ""
        }

    </div>

    <div class="admin-gallery-album-actions">

        <button
            type="button"
            class="view-album-btn"
            data-id="${album.id}"
        >
            View Photos
        </button>

        <button
            type="button"
            class="delete-album-btn"
            data-id="${album.id}"
        >
            Delete Album
        </button>

    </div>
`;

albumContainer.appendChild(albumItem);

});

}

loadAdminGalleryAlbums();
document.addEventListener("click", async function (event) {

    if (!event.target.classList.contains("view-album-btn")) {
        return;
    }

    const albumId = event.target.dataset.id;
    const albumItem = event.target.closest(".admin-gallery-album");

    if (!albumItem) return;

    let photoContainer =
        albumItem.querySelector(".admin-album-photos");

    if (photoContainer) {
        photoContainer.remove();
        event.target.textContent = "View Photos";
        return;
    }

    event.target.disabled = true;
    event.target.textContent = "Loading...";

    const { data: photos, error } =
        await supabaseClient
            .from("gallery_photos")
            .select("id, image_url, caption")
            .eq("album_id", albumId)
            .order("created_at", { ascending: false });

    event.target.disabled = false;
    event.target.textContent = "Hide Photos";

    if (error) {

        console.error(error);

        alert(
            "Unable to load photos: " +
            error.message
        );

        event.target.textContent = "View Photos";
        return;
    }

    photoContainer =
        document.createElement("div");

    photoContainer.className =
        "admin-album-photos";

    if (!photos || photos.length === 0) {

        photoContainer.innerHTML =
            "<p>No photos in this album yet.</p>";

    } else {

        photos.forEach(function (photo) {

            const photoCard =
                document.createElement("div");

            photoCard.className =
                "admin-album-photo";

            photoCard.innerHTML = `
                <img
                    src="${photo.image_url}"
                    alt="${photo.caption || "School photo"}"
                >

                <button
                    type="button"
                    class="delete-photo-btn"
                    data-id="${photo.id}"
                    data-url="${photo.image_url}"
                >
                    Delete Photo
                </button>
            `;

            photoContainer.appendChild(photoCard);

        });

    }

    albumItem.appendChild(photoContainer);

});
document.addEventListener("click", async function (event) {

    if (!event.target.classList.contains("delete-photo-btn")) {
        return;
    }

    const photoId =
        event.target.dataset.id;

    const photoUrl =
        event.target.dataset.url;

    const confirmDelete = confirm(
        "Are you sure you want to delete this photo?"
    );

    if (!confirmDelete) {
        return;
    }

    event.target.disabled = true;
    event.target.textContent = "Deleting...";


    /* Get the storage path */

    const marker = "/gallery/";

    const position =
        photoUrl.indexOf(marker);

    if (position === -1) {

        alert("Unable to identify the photo file.");

        event.target.disabled = false;
        event.target.textContent = "Delete Photo";

        return;
    }

    const filePath =
        photoUrl.substring(
            position + marker.length
        );


    /* Delete the actual image */

    const { error: storageError } =
        await supabaseClient
            .storage
            .from("gallery")
            .remove([filePath]);


    if (storageError) {

        console.error(storageError);

        alert(
            "Failed to delete the image: " +
            storageError.message
        );

        event.target.disabled = false;
        event.target.textContent = "Delete Photo";

        return;
    }


    /* Delete the database record */

    const { error: databaseError } =
        await supabaseClient
            .from("gallery_photos")
            .delete()
            .eq("id", photoId);


    if (databaseError) {

        console.error(databaseError);

        alert(
            "The image was removed, but its database record could not be deleted: " +
            databaseError.message
        );

        return;
    }


    alert("Photo deleted successfully!");


    /* Refresh the album photos */

    const viewButton =
        event.target
            .closest(".admin-gallery-album")
            ?.querySelector(".view-album-btn");

    if (viewButton) {

        viewButton.click();

        setTimeout(function () {
            viewButton.click();
        }, 100);

    }

});
document.addEventListener("click", async function (event) {

    if (!event.target.classList.contains("delete-album-btn")) {
        return;
    }

    const albumId =
        event.target.dataset.id;

    const confirmDelete = confirm(
        "Are you sure you want to delete this album? All photos in this album will also be removed."
    );

    if (!confirmDelete) {
        return;
    }

    event.target.disabled = true;
    event.target.textContent = "Deleting...";


    /* Find all photos in this album */

    const { data: photos, error: photoLoadError } =
        await supabaseClient
            .from("gallery_photos")
            .select("image_url")
            .eq("album_id", albumId);


    if (photoLoadError) {

        console.error(photoLoadError);

        alert(
            "Unable to find the album photos: " +
            photoLoadError.message
        );

        event.target.disabled = false;
        event.target.textContent = "Delete Album";

        return;
    }


    /* Delete the actual image files */

    if (photos && photos.length > 0) {

        const filePaths = photos
            .map(function (photo) {

                const marker = "/gallery/";

                const position =
                    photo.image_url.indexOf(marker);

                if (position === -1) {
                    return null;
                }

                return photo.image_url.substring(
                    position + marker.length
                );

            })
            .filter(Boolean);


        if (filePaths.length > 0) {

            const { error: storageError } =
                await supabaseClient
                    .storage
                    .from("gallery")
                    .remove(filePaths);


            if (storageError) {

                console.error(storageError);

                alert(
                    "The album could not be completely deleted: " +
                    storageError.message
                );

                event.target.disabled = false;
                event.target.textContent = "Delete Album";

                return;
            }
        }
    }


    /* Delete the album */

    const { error: albumDeleteError } =
        await supabaseClient
            .from("Gallery_albums")
            .delete()
            .eq("id", albumId);


    if (albumDeleteError) {

        console.error(albumDeleteError);

        alert(
            "Failed to delete album: " +
            albumDeleteError.message
        );

        event.target.disabled = false;
        event.target.textContent = "Delete Album";

        return;
    }


    alert("Album deleted successfully!");


    /* Refresh albums */

    loadAdminGalleryAlbums();
    loadGalleryAlbums();

});
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", async function () {

        logoutBtn.disabled = true;
        logoutBtn.textContent = "Logging out...";

        const { error } =
            await supabaseClient.auth.signOut();

        if (error) {
            console.error(error);

            alert(
                "Unable to log out: " +
                error.message
            );

            logoutBtn.disabled = false;
            logoutBtn.textContent = "Logout";

            return;
        }

        window.location.href = "admin.html";
    });
}
const resetPasswordForm =
    document.getElementById("resetPasswordForm");

if (resetPasswordForm) {

    resetPasswordForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const newPassword =
            document.getElementById("newPassword").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;

        const resetMessage =
            document.getElementById("resetMessage");

        if (newPassword !== confirmPassword) {

            resetMessage.textContent =
                "Passwords do not match.";

            return;
        }

        resetMessage.textContent =
            "Updating password...";

        const { error } =
            await supabaseClient.auth.updateUser({
                password: newPassword
            });

        if (error) {

            console.error(error);

            resetMessage.textContent =
                "Unable to update password: " +
                error.message;

            return;
        }

        resetMessage.textContent =
            "Password updated successfully!";

        setTimeout(function () {
            window.location.href = "admin.html";
        }, 1500);

    });

}