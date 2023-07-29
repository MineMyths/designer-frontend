import { ExpandMoreOutlined } from "@mui/icons-material";
import { Accordion, AccordionSummary, Typography } from "@mui/material";
import { useState } from "react";

export default function Accordian(props) {
	const [expanded, setExpanded] = useState(false);

	const { title, children } = props;

	const handleChange = (event) => {
		setExpanded(!expanded);
	};

    return (
        <Accordion expanded={expanded} onChange={handleChange}>
            <AccordionSummary
                expandIcon={<ExpandMoreOutlined />}
                id={`${title}-header`}
                aria-controls={`${title}-content`}
            >
                {title}
            </AccordionSummary>
            {children}
        </Accordion>
    )

}
