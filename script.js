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
// PUBLIC ANNOUNCEMENTS
// =========================================

async function loadPublicAnnouncements() {

    const announcementList =
        document.getElementById("publicAnnouncementList");

    if (!announcementList) {
        return;
    }

    const { data, error } = await supabaseClient
        .from("Announcement")
        .select("id, title, content, created_at")
        .eq("published", true)
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);

        announcementList.innerHTML = `
            <div class="no-announcements">
                <h3>Unable to Load Announcements</h3>
                <p>
                    Please try again later.
                </p>
            </div>
        `;

        return;
    }

    if (!data || data.length === 0) {

        announcementList.innerHTML = `
            <div class="no-announcements">
                <h3>No Announcements at the Moment</h3>

                <p>
                    There are no new announcements at this time.
                    Please check this page regularly for important
                    school updates and notices.
                </p>
            </div>
        `;

        return;
    }

    announcementList.innerHTML = "";

    data.forEach(function (announcement) {

        const item = document.createElement("div");

        item.className = "public-announcement-card";

        item.innerHTML = `
            <div class="public-announcement-header">
                <h3>${announcement.title}</h3>
            </div>

            <p class="public-announcement-content">
                ${announcement.content}
            </p>
        `;

        announcementList.appendChild(item);
    });
}

loadPublicAnnouncements();