import { Users } from "lucide-react";

export default function ResourceSlack({ result }) {
  if (!result) {
    return (
      <section className="panel emptyState">
        <h2>Resource Slack Optimizer</h2>
        <p>
          Nearby support zones will appear here after analysis.
        </p>
      </section>
    );
  }

  const optimizer = result.resource_slack_optimizer;

  return (
    <section className="panel">
      <h2>Resource Slack Optimizer</h2>
      <p className="subtitle">{optimizer.message}</p>

      <div className="slackList">
        {optimizer.suggestions && optimizer.suggestions.length > 0 ? (
          optimizer.suggestions.map((item, index) => (
            <div className="slackCard" key={index}>
              <Users size={22} />
              <div>
                <b>{item.zone}</b>
                <p>
                  Can lend {item.suggested_officers} officers · {item.reason}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="slackCard">
            <Users size={22} />
            <div>
              <b>No slack zone found</b>
              <p>
                The system could not identify a reliable nearby support zone from historical data.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}