import Panel from '../components/Panel.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Settings() {
  const { user, currentCampaign, setCurrentCampaign } = useAuth();

  const campaigns = user?.campaigns || [];

  // todo make this search for the campaign name instead of just being an id :/

  return (
    <Panel>
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <fieldset>
        <legend className="text-xl font-bold mb-2">Current Campaign</legend>
        {campaigns.length === 0 ? (
          <p>You are not assigned to any campaigns yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {campaigns.map((campaignId) => (
              <label key={campaignId} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="currentCampaign"
                  value={campaignId}
                  checked={currentCampaign === campaignId}
                  onChange={() => setCurrentCampaign(campaignId)}
                />
                {campaignId}
              </label>
            ))}
          </div>
        )}
      </fieldset>
    </Panel>
  );
}
