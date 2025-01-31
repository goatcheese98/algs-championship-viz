// Team configuration including colors and styling
const teamConfig = {
    defaultSettings: {
        fontFamily: "'Inter', sans-serif",
        fontSize: "13px",
        defaultColor: "#666666",
        defaultFontWeight: "400",
        top10FontWeight: "600"
    },

    getTeamTextColor: function(teamName, isTop10) {
        const color = this.teamColors[teamName];
        return color || this.defaultSettings.defaultColor;
    },

    getTeamFontWeight: function(isTop10) {
        return isTop10 ? this.defaultSettings.top10FontWeight : this.defaultSettings.defaultFontWeight;
    },

    teamColors: {
        // Teams from A vs B
        'FNATIC': '#FF5500',
        '100 Thieves': '#FF0000',
        'TSM': '#000000',
        'GUILD': '#4B0082',
        'Virtus.pro': '#FF1493',
        'ShopifyRebellion': '#9932CC',
        'SOURCE XNY': '#2d98da',
        'Meteor': '#1b998b',
        'NRG': '#D62128',
        'Cloud9': '#3498db',
        'Exo Clan': '#27ae60',
        'disguised': '#f59189',
        'GREEN STEGO': '#32CD32',
        'Complexity': '#4169E1',
        'Oblivion': '#eb3b5a',
        'VK GAMING': '#8B4513',
        'shadow3690': '#fed330',
        'DRAGONS': '#FF4500',
        'Ninjas': '#45aaf2',
        'FaZe Clan': '#4b6584',

        // Teams from C vs D
        'Alliance': '#FF69B4',
        'AURORA': '#9400D3',
        'FURIA': '#F7E300',
        'Liquid Alienware': '#00BFFF',
        'Envy': '#2F4F4F',
        'CRAZY RACCOON': '#FFD700',
        'GaiminGladiators': '#16a085',
        'ENTER FORCE.36': '#4682B4',
        'REIGNITE': '#20bf6b',
        'Team Burger': '#FF8C00',
        'GoNext': '#8B0000',
        'Team Falcons': '#e74c3c',
        'GHS Professional': '#556B2F',
        'Zero Tenacity': '#483D8B',
        'LG': '#008080',
        'STALLIONS': '#FF4500',
        'OrglessAndHungry': '#BDB76B',
        'Noctem': '#7FFF00',
        'Supernova': '#fa8231',
        'DreamFire': '#B22222'
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = teamConfig;
}
