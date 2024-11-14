const express = require('express');
const app = express();
app.use(express.json());

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
let tickets = [];
let ticketId = 1;

function calculateLineResult(line) {
    if (!Array.isArray(line) || line.length !== 3) {
        throw new TypeError("Line must be an array with exactly three numbers");
    }
    const [a, b, c] = line;
    if (a + b + c === 2) return 10;
    if (a === b && b === c) return 5;
    if (a !== b && a !== c) return 1;
    return 0;
}


app.post('/ticket', (req, res) => {
    const { linesCount } = req.body;
    const lines = Array.from({ length: linesCount }, () => [
        Math.floor(Math.random() * 3),
        Math.floor(Math.random() * 3),
        Math.floor(Math.random() * 3)
    ]);
    const ticket = { id: ticketId++, lines, isChecked: false };
    tickets.push(ticket);
    res.status(201).json(ticket);
});

  
  app.get('/ticket', (req, res) => {
    res.json(tickets);
  });

  app.get('/', (req, res) => {
    res.json("use Lottery system enpoints to access all the apis");
  });

  app.get('/ticket/:id', (req, res) => {
    const ticket = tickets.find(t => t.id == req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json(ticket);
  });
  
  app.put('/ticket/:id', (req, res) => {
    const ticket = tickets.find(t => t.id == req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    if (ticket.isChecked) return res.status(400).json({ error: 'Ticket cannot be amended' });
  
    const { linesCount } = req.body;
    const newLines = Array.from({ length: linesCount }, () => [
      Math.floor(Math.random() * 3),
      Math.floor(Math.random() * 3),
      Math.floor(Math.random() * 3)
    ]);
    ticket.lines.push(...newLines);
    res.json(ticket);
  });



app.put('/status/:id', (req, res) => {
    const ticket = tickets.find(t => t.id == req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    // Check if the ticket status has already been checked
    if (ticket.isChecked) {
        return res.status(200).json({
            message: "Status already checked",
            ticket: ticket
        });
    }

    try {
        // Calculate results for each line and sort them by result
        ticket.lines = ticket.lines
            .map(line => {
                if (Array.isArray(line) && line.length === 3) {
                    return {
                        line,
                        result: calculateLineResult(line)
                    };
                } else {
                    throw new TypeError("Line is not in the expected format");
                }
            })
            .sort((a, b) => b.result - a.result);  // Sort lines by result in descending order

        ticket.isChecked = true;  // Mark the ticket as checked
        res.json(ticket);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});




  