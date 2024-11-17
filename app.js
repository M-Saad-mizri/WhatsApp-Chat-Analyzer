// let chatData = ""; // Initialize chatData to hold chat content
// let messages = []; // Initialize messages globally

// function loadChatData() {
//     const infoElements = document.querySelectorAll('.info');
//     infoElements.forEach(function (element) {
//         element.style.display = 'none';
//     });

//     document.getElementById("Display-Chat").style.display = "flex";
//     document.getElementById("Analyze-Chat").style.display = "flex";
//     const fileInput = document.getElementById("chatFile");
//     const file = fileInput.files[0];

//     if (file) {
//         const reader = new FileReader();
//         reader.onload = function (event) {
//             chatData = event.target.result; // Load file content into chatData
//         };
//         reader.readAsText(file);
//     } else {
//         alert("Please upload a chat file.");
//         document.getElementById("Display-Chat").style.display = "none";
//         document.getElementById("Analyze-Chat").style.display = "none";
//     }
// }

let chatData = ""; // Initialize chatData to hold chat content
let messages = []; // Initialize messages globally

function loadChatData() {
    const infoElements = document.querySelectorAll('.info');
    infoElements.forEach(function (element) {
        element.style.display = 'none';
    });

    document.getElementById("Display-Chat").style.display = "flex";
    document.getElementById("Analyze-Chat").style.display = "flex";
    document.getElementById("moving-border").style.display = "none";
    const fileInput = document.getElementById("chatFile");
    const file = fileInput.files[0];

    if (file) {
        if (file.name.endsWith(".zip")) {
            // If it's a zip file, handle it with JSZip
            handleZipFile(file);
        } else if (file.name.endsWith(".txt")) {
            // If it's a .txt file, handle it normally
            const reader = new FileReader();
            reader.onload = function (event) {
                chatData = event.target.result; // Load file content into chatData
                displayChatContent(chatData); // Display or process the chat content
            };
            reader.readAsText(file);
        } else {
            alert("Please upload a valid .txt or .zip chat file.");
            document.getElementById("Display-Chat").style.display = "none";
            document.getElementById("Analyze-Chat").style.display = "none";
            document.getElementById("infoo").style.display = "flex";
            document.getElementById("info").style.display = "flex";
            document.getElementById("info1").style.display = "block";
            document.getElementById("info2").style.display = "flex";
            document.getElementById("moving-border").style.display = "block";
        }
    } else {
        alert("Please upload a chat file.");
        document.getElementById("Display-Chat").style.display = "none";
        document.getElementById("Analyze-Chat").style.display = "none";
        document.getElementById("infoo").style.display = "flex";
        document.getElementById("info").style.display = "flex";
        document.getElementById("info1").style.display = "block";
        document.getElementById("info2").style.display = "flex";
        document.getElementById("moving-border").style.display = "block";
    }
}

function handleZipFile(zipFile) {
    const zip = new JSZip();
    const fileName = zipFile.name;

    // Load and extract the .zip file content
    const reader = new FileReader();
    reader.onload = function (event) {
        zip.loadAsync(event.target.result).then(function (contents) {
            // Find a .txt file in the zip archive
            const txtFiles = Object.keys(contents.files).filter(file => file.endsWith(".txt"));

            if (txtFiles.length === 0) {
                alert("No .txt file found in the zip archive.");
                return;
            }

            // Read the first .txt file found in the zip
            const txtFile = contents.files[txtFiles[0]];
            txtFile.async("text").then(function (txtContent) {
                chatData = txtContent; // Load the content of the .txt file into chatData
                displayChatContent(chatData); // Display or process the chat content
            });
        }).catch(function (error) {
            alert("Error loading zip file: " + error);
        });
    };
    reader.readAsArrayBuffer(zipFile);
}

function displayChatContent(data) {
    // This function can display chat data or trigger further analysis
    console.log("Chat Content Loaded: ", data);
    // Now you can pass this `data` to the `parseChat` function
    const parsedData = parseChat(data);

    // Example: Displaying parsed messages or stats
    console.log(parsedData);
}

function parseChat(data) {
    const messages = [];
    const dayCount = {};
    const responseTimes = {};
    const userStats = {};
    const wordFrequency = {};

    const lines = data.split("\n");
    let lastTimestamp = null;

    lines.forEach((line) => {
        const match = line.match(
            /(\d{2}\/\d{2}\/\d{4}), (\d{2}:\d{2}) - (.*?): (.*)/
        );
        if (match) {
            const [, date, time, sender, message] = match;
            messages.push({ date, time, sender, message });

            // Message Frequency by Day
            const day = date.split("/")[0];
            dayCount[day] = (dayCount[day] || 0) + 1;

            // User Statistics
            if (!userStats[sender]) {
                userStats[sender] = { messages: 0, activeHours: [] };
            }
            userStats[sender].messages++;
            userStats[sender].activeHours.push(parseInt(time.split(":")[0]));

            // Response Time Calculation
            if (lastTimestamp && lastTimestamp.sender !== sender) {
                const responseTime = calculateTimeDiff(lastTimestamp, {
                    date,
                    time,
                });
                responseTimes[sender] = (responseTimes[sender] || []).concat(
                    responseTime
                );
            }
            lastTimestamp = { date, time, sender };

            // Word Frequency Calculation
            message.split(" ").forEach((word) => {
                const sanitizedWord = word
                    .toLowerCase()
                    .replace(/[^a-zA-Z0-9]/g, ""); // Remove punctuation
                if (!stopWords.includes(sanitizedWord) && sanitizedWord) {
                    wordFrequency[sanitizedWord] =
                        (wordFrequency[sanitizedWord] || 0) + 1;
                }
            });
        }
    });

    return { messages, dayCount, responseTimes, userStats, wordFrequency };
}


function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Capture the HTML content of the chat report
    const chatContent = document.getElementById("results").innerHTML;

    // Add the content to the PDF
    doc.html(chatContent, {
        callback: function (doc) {
            // Save the generated PDF
            doc.save('whatsapp-chat-report.pdf');
        },
        x: 10,
        y: 10
    });
}

const stopWords = [
    "the",
    "is",
    "and",
    "a",
    "to",
    " in ",
    "for",
    " of ",
    "it",
    "on",
    "that",
    "this",
]; // Basic list of stop words

// function parseChat(data) {
//     const messages = [];
//     const dayCount = {};
//     const responseTimes = {};
//     const userStats = {};
//     const wordFrequency = {};

//     const lines = data.split("\n");
//     let lastTimestamp = null;

//     lines.forEach((line) => {
//         const match = line.match(
//             /(\d{2}\/\d{2}\/\d{4}), (\d{2}:\d{2}) - (.*?): (.*)/
//         );
//         if (match) {
//             const [, date, time, sender, message] = match;
//             messages.push({ date, time, sender, message });

//             // Message Frequency by Day
//             const day = date.split("/")[0];
//             dayCount[day] = (dayCount[day] || 0) + 1;

//             // User Statistics
//             if (!userStats[sender]) {
//                 userStats[sender] = { messages: 0, activeHours: [] };
//             }
//             userStats[sender].messages++;
//             userStats[sender].activeHours.push(parseInt(time.split(":")[0]));

//             // Response Time Calculation
//             if (lastTimestamp && lastTimestamp.sender !== sender) {
//                 const responseTime = calculateTimeDiff(lastTimestamp, {
//                     date,
//                     time,
//                 });
//                 responseTimes[sender] = (responseTimes[sender] || []).concat(
//                     responseTime
//                 );
//             }
//             lastTimestamp = { date, time, sender };

//             // Word Frequency Calculation
//             message.split(" ").forEach((word) => {
//                 const sanitizedWord = word
//                     .toLowerCase()
//                     .replace(/[^a-zA-Z0-9]/g, ""); // Remove punctuation
//                 if (!stopWords.includes(sanitizedWord) && sanitizedWord) {
//                     wordFrequency[sanitizedWord] =
//                         (wordFrequency[sanitizedWord] || 0) + 1;
//                 }
//             });
//         }
//     });

//     return { messages, dayCount, responseTimes, userStats, wordFrequency };
// }

function showChat() {
    document.getElementById("chatViewer").style.display = "flex";
    document.getElementById("results").style.display = "none";
    document.getElementById("canv").style.display = "none";
    const parsedData = parseChat(chatData);
    messages = parsedData.messages;

    const currentUser = messages[1].sender; // Set this dynamically in your application as needed
    function displayChat(messages) {
        const chatViewer = document.getElementById("chatViewer");
        chatViewer.innerHTML = ""; // Clear previous messages

        messages.forEach((msg) => {
            const messageDiv = document.createElement("div");

            // Use "sent" class if the sender is the current user
            if (msg.sender === currentUser) {
                messageDiv.classList.add("message", "sent");
            } else {
                messageDiv.classList.add("message", "received");
            }

            messageDiv.innerHTML = `
                                        <span><strong>${msg.sender}</strong></span><br>
                                        <span>${msg.message}</span><br>
                                        <small style="color: gray;">${msg.date}, ${msg.time}</small>
                                    `;

            chatViewer.appendChild(messageDiv);
        });
    }

    displayChat(messages);
}

function calculateTimeDiff(timestamp1, timestamp2) {
    const [date1, time1] = [timestamp1.date, timestamp1.time];
    const [date2, time2] = [timestamp2.date, timestamp2.time];

    const dateObj1 = new Date(
        `${date1.split("/").reverse().join("-")}T${time1}`
    );
    const dateObj2 = new Date(
        `${date2.split("/").reverse().join("-")}T${time2}`
    );

    return Math.abs((dateObj2 - dateObj1) / 1000 / 60); // Difference in minutes
}

function analyzeChat(Messages) {
    document.getElementById("chatViewer").style.display = "none";
    document.getElementById("results").style.display = "block";
    document.getElementById("canv").style.display = "block";
    const parsedData = parseChat(chatData);
    messages = parsedData.messages; // Store parsed messages globally

    // Set the first message details (first message date)
    document.getElementById(
        "first-msg-one"
    ).innerText = `${messages[0].sender} on ${messages[0].date}`;
    document.getElementById("last-msg-one").innerText = `${messages[0].sender
        } on ${messages[messages.length - 1].date}`;

    // Initialize variables for last message of second sender
    let lastMsgSenderTwoDate = null;
    let secondSender = null;

    // Loop through messages, checking if the sender differs from messages[0].sender
    for (let i = 1; i < messages.length; i++) {
        if (messages[i].sender !== messages[0].sender) {
            // This is the first message from the second sender
            secondSender = messages[i].sender;
            document.getElementById(
                "first-msg-two"
            ).innerText = `${messages[i].sender} on ${messages[i].date}`;

            // Find the last message from this second sender
            for (let j = messages.length - 1; j >= 0; j--) {
                if (messages[j].sender === secondSender) {
                    lastMsgSenderTwoDate = messages[j].date;
                    break;
                }
            }

            // Set the last message details for the second sender
            document.getElementById(
                "last-msg-two"
            ).innerText = `${secondSender} on ${lastMsgSenderTwoDate}`;
            break; // Stop once we find the second sender
        }
    }

    // Count unique days
    const uniqueDates = new Set();
    messages.forEach((message) => {
        const date = message.date; // Extract date from each message
        uniqueDates.add(date); // Add date to the Set (automatically handles uniqueness)
    });

    const { dayCount, responseTimes, userStats, wordFrequency } =
        parsedData;

    // Get the number of unique days
    const totalUniqueDays = uniqueDates.size;

    // Set the value of the element with ID "daysCount"
    document.getElementById(
        "daysCount"
    ).innerHTML = `<b>Total Chat Days: </b>You Guys Chat For ${totalUniqueDays} Days`;

    // Find the most and least active day
    const mostActiveDayKey = Object.keys(dayCount).reduce((a, b) =>
        dayCount[a] > dayCount[b] ? a : b
    );
    const leastActiveDayKey = Object.keys(dayCount).reduce((a, b) =>
        dayCount[a] < dayCount[b] ? a : b
    );

    // Display Most and Least Active Days with their counts
    document.getElementById(
        "mostActiveDay"
    ).innerText = `${mostActiveDayKey} with ${dayCount[mostActiveDayKey]} messages`;
    document.getElementById(
        "leastActiveDay"
    ).innerText = `${leastActiveDayKey} with ${dayCount[leastActiveDayKey]} messages`;

    // Identify missed days (days with no chat)
    const missedDays = getMissedDays(messages);

    // Display missed days in the list with ID "missedDays"
    const missedDaysList = document.getElementById("missedDays");
    missedDays.forEach((day) => {
        const listItem = document.createElement("li");
        listItem.innerText = day;
        missedDaysList.appendChild(listItem);
    });

    // renderChattingTimeGraph(messages);
    renderChattingTimeGraph(messages);

    // Render other charts and stats
    renderMessageFrequencyChart(dayCount);
    renderResponseTimeChart(responseTimes);
    renderUserStatistics(userStats);
}

// Helper function to get missed days
function getMissedDays(messages) {
    // Get the start and end date from the messages
    const startDate = new Date(
        messages[0].date.split("/").reverse().join("/")
    );
    const endDate = new Date(
        messages[messages.length - 1].date.split("/").reverse().join("/")
    );

    // Generate an array of all dates in the range
    const allDates = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        allDates.push(formatDate(currentDate));
        currentDate.setDate(currentDate.getDate() + 1); // Increment the date by 1
    }

    // Find missing dates by comparing with the uniqueDates set
    const uniqueDates = new Set(messages.map((msg) => msg.date));
    const missedDates = allDates.filter((date) => !uniqueDates.has(date));

    return missedDates;
}

// Helper function to format date as "dd/mm/yyyy"
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}

// Helper function to get the number of messages per hour of the day
function getMessagesPerHour(messages) {
    const messagesPerHour = Array(24).fill(0); // Array to store message count for each hour of the day (0-23)

    // Loop through messages to count them per hour
    messages.forEach((message) => {
        const time = message.time;
        const hour = parseInt(time.split(":")[0]); // Get the hour from the time (e.g., 14 from "14:30")

        // Increment the message count for the respective hour
        if (hour >= 0 && hour < 24) {
            messagesPerHour[hour]++;
        }
    });

    return messagesPerHour;
}

// Function to render the "Time of Day" graph (Messages per hour)
function renderChattingTimeGraph(messages) {
    const ctx = document
        .getElementById("chattingTimeChart")
        .getContext("2d");

    // Get the number of messages sent per hour
    const messagesPerHour = getMessagesPerHour(messages);

    // Create an array for the x-axis labels (representing hours from 0 AM to 11 PM)
    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);

    // Create the bar chart
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: hours, // Labels represent hours of the day (0 AM to 11 PM)
            datasets: [
                {
                    label: "Messages Sent Per Hour", // Label for the dataset (this will appear in the legend)
                    data: messagesPerHour, // The number of messages per hour
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Time of Day",
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: "Number of Messages",
                    },
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1, // Ensures tick marks are spaced 1 by 1
                    },
                },
            },
        },
    });
}


function convertTimeToDate(date, time) {
    const [day, month, year] = date.split("/").map((num) => parseInt(num));
    const [hours, minutes] = time.split(":").map((num) => parseInt(num));

    // Create a Date object for the specific day and time
    return new Date(year, month - 1, day, hours, minutes);
}

function renderUserStatistics(userStats) {
    const userStatsList = document.getElementById("userStatsList");
    const chartsContainer = document.getElementById("chartsContainer");

    // Clear existing content
    userStatsList.innerHTML = "";
    chartsContainer.innerHTML = "";

    let totalMessagesAcrossAllUsers = 0;
    const userNames = [];
    const userMessages = [];

    // Loop through each user and calculate statistics
    for (let user in userStats) {
        const totalMessages = userStats[user].messages;
        const activeHours = userStats[user].activeHours;
        const peakHour = getPeakHour(activeHours);

        // Add stat text for each user
        const statText = `<li class="stat-item"><strong>${user}:</strong> ${totalMessages} messages (Most active hour: ${peakHour}:00)</li>`;
        userStatsList.innerHTML += statText;
        totalMessagesAcrossAllUsers += totalMessages;

        // Prepare data for chart
        userNames.push(user);
        userMessages.push(totalMessages);
    }

    // Add total messages across all users at the end
    const totalMessagesText = `<li class="stat-item"><strong>Total messages:</strong> ${totalMessagesAcrossAllUsers}</li>`;
    userStatsList.innerHTML += totalMessagesText;

    // Create and render donut chart
    const chartContainer = document.createElement("div");
    chartContainer.style.width = "200px"; // Specify chart container size
    chartContainer.innerHTML = '<canvas id="userStatsChart"></canvas>';
    chartsContainer.appendChild(chartContainer);

    createDonutChart(userNames, userMessages, totalMessagesAcrossAllUsers);
}

// Function to create the donut chart using Chart.js
function createDonutChart(
    userNames,
    userMessages,
    totalMessagesAcrossAllUsers
) {
    const ctx = document.getElementById("userStatsChart").getContext("2d");

    new Chart(ctx, {
        type: "doughnut", // Create a donut chart
        data: {
            labels: userNames, // User names as labels
            datasets: [
                {
                    data: userMessages, // User messages count
                    backgroundColor: [
                        "#FF6384",
                        "#36A2EB",
                        "#FFCE56",
                        "#4BC0C0",
                        "#FF9F40",
                    ], // Color for each user segment
                    hoverBackgroundColor: [
                        "#FF6384",
                        "#36A2EB",
                        "#FFCE56",
                        "#4BC0C0",
                        "#FF9F40",
                    ],
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "top",
                },
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            const total = tooltipItem.raw;
                            const percentage = (
                                (total / totalMessagesAcrossAllUsers) *
                                100
                            ).toFixed(1);
                            return `${tooltipItem.label}: ${total} messages(${percentage} %)`;
                        },
                    },
                },
            },
            cutoutPercentage: 60, // For the donut effect (leave a hole in the center)
        },
    });
}

// Helper function to get the peak hour (most active hour)
function getPeakHour(activeHours) {
    let peakHour = 0;
    let maxMessages = 0;

    for (let hour in activeHours) {
        if (activeHours[hour] > maxMessages) {
            maxMessages = activeHours[hour];
            peakHour = hour;
        }
    }
    return peakHour;
}

function renderMessageFrequencyChart(dayCount) {
    const ctx = document
        .getElementById("messageFrequencyChart")
        .getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: Object.keys(dayCount),
            datasets: [
                {
                    label: "Messages per Day",
                    data: Object.values(dayCount),
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1,
                },
            ],
        },
        options: {
            scales: {
                y: { beginAtZero: true },
            },
        },
    });
}

function renderResponseTimeChart(responseTimes) {
    const userNames = Object.keys(responseTimes);
    const avgResponseTimes = userNames.map(
        (name) =>
            responseTimes[name].reduce((a, b) => a + b, 0) /
            responseTimes[name].length
    );

    const ctx = document
        .getElementById("responseTimeChart")
        .getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: userNames,
            datasets: [
                {
                    label: "Average Response Time (minutes)",
                    data: avgResponseTimes,
                    backgroundColor: "rgba(255, 99, 132, 0.2)",
                    borderColor: "rgba(255, 99, 132, 1)",
                    borderWidth: 1,
                },
            ],
        },
        options: {
            scales: {
                y: { beginAtZero: true },
            },
        },
    });
}