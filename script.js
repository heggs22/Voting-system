// Function to handle voting
function submitVote(option, candidate) {
    // Simulate sending data to the server
    console.log(`Voted for ${candidate} under ${option}`);

    // Display a thank-you message with animation
    const thankYouMessage = document.getElementById('thank-you');
    thankYouMessage.classList.add('show');

    // Display the option and candidate the user voted for
    document.getElementById('vote-result').innerText = `You voted for ${candidate} under ${option}`;

    // Disable further voting by hiding all vote buttons
    const buttons = document.querySelectorAll('.candidate-btn');
    buttons.forEach(button => button.disabled = true);
}
